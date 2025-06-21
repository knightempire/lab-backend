//controllers/requests.controllers.js
const Requests = require('../models/requests.model');
const Users = require('../models/user.model');
const Products = require('../models/product.model');
const mongoose = require('mongoose');
const moment = require("moment-timezone");
const { sendUserReminderEmail, sendUserDelayEmail } = require('../middleware/mail/mail');
const { sendStaffNotifyEmail ,sendStaffAcceptEmail, sendStaffRejectEmail,sendUserNotifyEmail ,sendUserAcceptEmail , sendUserRejectEmail ,sendUserCollectEmail } = require('../middleware/mail/mail');

const { appendRow, updateRowbyReqID } = require('../middleware/googlesheet');
const requestIdRegex = /^REQ-[FS]-\d{2}\d{4}$/;

// Helper to validate requestId
function validateRequestId(id) {
    return typeof id === 'string' && requestIdRegex.test(id);
}

const generateRequestId = async (isFaculty) => {
    const currentYear = new Date().getFullYear();

    const prefix = `REQ-${isFaculty ? 'F' : 'S'}-${currentYear.toString().slice(-2)}`;

    const latestRequest = await Requests.findOne({
        requestId: { $regex: `^${prefix}` }
    }).sort({ requestId: -1 });

    let nextSerial = '0001';
    if (latestRequest) {
        const lastSerial = parseInt(latestRequest.requestId.slice(-4));
        nextSerial = (lastSerial + 1).toString().padStart(4, '0');
    }

    return `${prefix}${nextSerial}`;
};

const addRequest = async (req, res) => {
  try {
    let {
      userid,
      referenceId,
      description,
      requestedDays,
      requestedProducts,
    } = req.body;

    // Required fields check
    const requiredFields = ['userid', 'description', 'requestedDays', 'requestedProducts'];
    const missingFields = requiredFields.filter(field => req.body[field] === undefined);

    if (missingFields.length > 0) {
      return res.status(400).json({
        message: `Missing required fields: ${missingFields.join(', ')}`
      });
    }

    // Validate requestedProducts
    if (!Array.isArray(requestedProducts) || requestedProducts.length === 0) {
      return res.status(400).json({ message: 'requestedProducts must be a non-empty array' });
    }

    for (const prod of requestedProducts) {
      if (
        !mongoose.Types.ObjectId.isValid(prod.productId) ||
        typeof prod.quantity !== 'number' ||
        prod.quantity < 1
      ) {
        return res.status(400).json({
          message: 'Each requestedProduct must have a valid productId and a positive quantity'
        });
      }
    }

    const user = await Users.findById(userid);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const requestId = await generateRequestId(user.isFaculty);

    // Prepare requestData with required fields
    const requestData = {
      requestId,
      userId: userid,
      description,
      requestedDays,
      requestedProducts
    };

    // Logic for referenceId based on isFaculty
    if (!user.isFaculty) {
      // For students, referenceId is mandatory
      if (!referenceId) {
        return res.status(400).json({ message: 'Reference ID is required for students' });
      }
      requestData.referenceId = referenceId;
    } else {
      // For faculty, set referenceId to null or omit it
      requestData.referenceId = null;  // or simply do not set this property
    }

    const newRequest = new Requests(requestData);
    await newRequest.save();

    const populatedRequest = await Requests.findById(newRequest._id)
      .populate('userId', 'name email rollNo')
      .populate('referenceId', 'name email rollNo')
      .populate('requestedProducts.productId', 'product_name');

    // Format response safely checking referenceId existence
    const responseData = {
      requestId: populatedRequest.requestId,
      user: {
        name: populatedRequest.userId.name,
        email: populatedRequest.userId.email,
        rollNo: populatedRequest.userId.rollNo
      },
      reference: populatedRequest.referenceId ? {
        name: populatedRequest.referenceId.name,
        email: populatedRequest.referenceId.email,
        rollNo: populatedRequest.referenceId.rollNo
      } : null,
      description: populatedRequest.description,
      requestedDays: populatedRequest.requestedDays,
      requestedProducts: populatedRequest.requestedProducts.map(item => ({
        productName: item.productId ? item.productId.product_name : null,
        quantity: item.quantity
      })),
      requestDate: populatedRequest.requestDate,
      requestStatus: populatedRequest.requestStatus
    };

    // Only send email notification if reference exists
    if (populatedRequest.referenceId) {
      await sendStaffNotifyEmail(
        populatedRequest.referenceId.email,
        populatedRequest.referenceId.name,
        populatedRequest.userId.rollNo.toUpperCase(),
        populatedRequest.userId.name,
        populatedRequest.requestId
      );
    }

    const moment = require('moment-timezone');

    const currentDate = moment().tz('Asia/Kolkata').format('DD/MM/YYYY HH:mm');
    
    await sendUserNotifyEmail(
        user.email,
        user.name,
        requestedDays,
        currentDate,
        requestId
        );

    return res.status(201).json({
      status: 201,
      message: 'Request created successfully',
      request: responseData
    });

  } catch (err) {
    console.error('Error in addRequest:', err);
    return res.status(500).json({ message: 'Server error' });
  }
};

const updateRequest = async (req, res) => {
    try {
        const { id } = req.params;

        if (!validateRequestId(id)) {
            return res.status(400).json({ message: 'Invalid requestId format.' });
        }

        const request = await Requests.findOne({ requestId: id });
        if (!request) {
            return res.status(404).json({ message: `Request with ID: ${id} doesn't exist.` });
        }

        // if (request.requestStatus !== 'pending') {
        //     return res.status(400).json({ message: 'Request is not in pending status.' });
        // }

        if (request.collectedDate !== null) {
            return res.status(400).json({ message: 'The products have been collected.' });
        }

        const fields = ['issued', 'adminApprovedDays', 'scheduledCollectionDate'];
        const updates = {};
        for (let i of fields) {
            if (req.body[i] !== undefined) {
                updates[i] = req.body[i];
            }
        }

        if (updates.issued) {
            if (!Array.isArray(updates.issued) || updates.issued.length === 0) {
                return res.status(400).json({ message: 'issued must be a non-empty array' });
            }
            for (const item of updates.issued) {
                if (
                    !item.issuedProductId ||
                    !mongoose.Types.ObjectId.isValid(item.issuedProductId) ||
                    typeof item.issuedQuantity !== 'number' ||
                    item.issuedQuantity < 1
                ) {
                    return res.status(400).json({
                        message: 'Each issued item must have a valid issuedProductId and a positive issuedQuantity'
                    });
                }
            }

            const oldIssued = {};
            if (Array.isArray(request.issued)) {
                for (const item of request.issued) {
                    oldIssued[item.issuedProductId.toString()] = item.issuedQuantity;
                }
            }

            for (const item of updates.issued) {
                const productId = item.issuedProductId.toString();
                const oldQuantity = oldIssued[productId] || 0;
                const diff = item.issuedQuantity - oldQuantity;
                if (diff !== 0) {
                    await Products.findByIdAndUpdate(
                        productId,
                        { $inc: { yetToGive: diff } }
                    );
                }
                delete oldIssued[productId];
            }

            for (const removedProdId in oldIssued) {
                await Products.findByIdAndUpdate(
                    removedProdId,
                    { $inc: { yetToGive: -oldIssued[removedProdId] } }
                );
            }
        }

        const updatedRequest = await Requests.findOneAndUpdate(
            { requestId: id },
            { $set: updates },
            { new: true, runValidators: true }
        )
        .populate('userId', 'name email rollNo')
        .populate('referenceId', 'name email rollNo');

        if (!updatedRequest) {
            return res.status(404).json({ message: `Request with ID: ${id} doesn't exist.` });
        }

        return res.status(200).json({
            status: 200,
            message: 'Request updated successfully',
            request: updatedRequest,
        });
    } catch (err) {
        console.error('Error in updateRequest:', err);
        return res.status(500).json({ message: 'Server error' });
    }
};


//withput issued
const updateProductRequest = async (req, res) => {
    try {
        const { id } = req.params;
        if (!validateRequestId(id)) {
            return res.status(400).json({ message: 'Invalid requestId format.' });
        }
        const { issued, adminApprovedDays } = req.body;
        console.log("updateProductRequest", id, issued, adminApprovedDays);
        // Validate issued array    
        if (!Array.isArray(issued) || issued.length === 0) {
            return res.status(400).json({ message: 'Issued must be a non-empty array' });
        }

        for (const item of issued) {
            if (
                !item.issuedProductId ||
                !mongoose.Types.ObjectId.isValid(item.issuedProductId) ||
                typeof item.issuedQuantity !== 'number' ||
                item.issuedQuantity < 1
            ) {
                return res.status(400).json({
                    message: 'Each issued item must have a valid issuedProductId and a positive issuedQuantity'
                });
            }
        }

        // Optional: Validate adminApprovedDays
        if (adminApprovedDays !== undefined) {
            if (typeof adminApprovedDays !== 'number' || adminApprovedDays < 0) {
                return res.status(400).json({
                    message: 'adminApprovedDays must be a non-negative number'
                });
            }
        }

        // Find the request using requestId
        const request = await Requests.findOne({ requestId: id });

        if (!request) {
            return res.status(404).json({ message: `Request with requestId: ${id} doesn't exist.` });
        }

        // Update issued and adminApprovedDays (if provided)
        request.issued = issued;
        if (adminApprovedDays !== undefined) {
            request.adminApprovedDays = adminApprovedDays;
        }

        await request.save();

        // Populate necessary fields after update
        const populatedRequest = await Requests.findById(request._id)
            .populate('userId', 'name email rollNo');

        return res.status(200).json({
            status: 200,
            message: 'Issued items and adminApprovedDays updated successfully',
            request: populatedRequest,
        });
    } catch (err) {
        console.error('Error in updateProductRequest:', err);
        return res.status(500).json({ message: 'Server error' });
    }
};

const fetchAllRequests = async (req, res) => {
    try {
        //Fetch all requests and populate user references
        const requests = await Requests.find()
            .populate('userId', 'name email rollNo phoneNo isFaculty')
            .populate('referenceId', 'name email rollNo');


        //Send the request details
        return res.status(200).json({
            status: 200,
            message: 'Requests fetched successfully',
            requests: requests
        });
    } catch (err) {
        console.error('Error in fetchAllRequest:', err);
        return res.status(500).json({ message: 'Server error' });
    }
};

const fetchRequest = async (req, res) => {
    try {
        const { id } = req.params;

        if (!validateRequestId(id)) {
            return res.status(400).json({ message: 'Invalid requestId format.' });
        }

        //Fetch request by ID and populate user references
        const request = await Requests.findOne({ requestId: id })
            .populate('userId', 'name email rollNo phoneNo isFaculty')
            .populate('referenceId', 'name email rollNo')
            .populate('requestedProducts.productId', 'product_name')  
             .populate('issued.issuedProductId', 'product_name'); 

        if (!request) {
            return res.status(404).json({ message: 'Request not found' });
        }

        //Send request details
        return res.status(200).json({
            status: 200,
            message: 'Request fetched successfully',
            request: request
        });
    } catch (err) {
        console.error('Error in fetchRequest:', err);
        return res.status(500).json({ message: 'Server error' });
    }
};

const approveRequest = async (req, res) => {
    try {
        const { id } = req.params;
        if (!validateRequestId(id)) {
            return res.status(400).json({ message: 'Invalid requestId format.' });
        }
        const { issued, adminReturnMessage, adminApprovedDays, scheduledCollectionDate } = req.body;

        if (!Array.isArray(issued) || issued.length === 0) {
            return res.status(400).json({ message: 'Issued must be a non-empty array' });
        }

        // Validate issued array
        for (const item of issued) {
            if (
                !item.issuedProductId ||
                !mongoose.Types.ObjectId.isValid(item.issuedProductId) ||
                typeof item.issuedQuantity !== 'number' ||
                item.issuedQuantity < 1
            ) {
                return res.status(400).json({
                    message: 'Each issued item must have a valid issuedProductId and a positive issuedQuantity'
                });
            }
        }

        // Update product stock
        for (const item of issued) {
            await Products.findByIdAndUpdate(
                item.issuedProductId,
                { $inc: { yetToGive: item.issuedQuantity } }
            );
        }

        const updateData = {
            issued,
            issuedDate: moment.tz("Asia/Kolkata").toDate(),
            requestStatus: 'approved',
            adminApprovedDays,
            scheduledCollectionDate
        };

        if (adminReturnMessage) {
            updateData.adminReturnMessage = adminReturnMessage;
        }

        // Find by 'requestId' and update the request
        const approvedRequest = await Requests.findOneAndUpdate(
            { requestId: id },
            { $set: updateData },
            { new: true, runValidators: true }
        )
        .populate('userId', 'name email rollNo')
        .populate('referenceId', 'name email rollNo');

        if (!approvedRequest) {
            return res.status(404).json({ message: `Request with ID: ${id} doesn't exist.` });
        }

        await appendRow([id, scheduledCollectionDate,  'hold', adminApprovedDays,0]);

        const requestID = approvedRequest.requestId;
        const studentName = approvedRequest.userId.name;
        const referenceRollNo = approvedRequest.userId.rollNo.toUpperCase();

        if (approvedRequest.referenceId) {
        const referenceEmail = approvedRequest.referenceId.email;
        const referenceName = approvedRequest.referenceId.name;

        await sendStaffAcceptEmail(referenceEmail, referenceName, referenceRollNo, studentName, requestID);
        }

          
                const formattedRequestDate = moment(approvedRequest.requestDate)
                .tz("Asia/Kolkata")
                .format("DD/MM/YYYY HH:mm");

                // Send email to the student
                await sendUserAcceptEmail(
                approvedRequest.userId.email,
                approvedRequest.userId.name,
                formattedRequestDate,                  
                adminApprovedDays,                    
                scheduledCollectionDate,     
                requestID                         
                );



        // Send success response with approved request details
        return res.status(200).json({
            status: 200,
            message: 'Request approved successfully',
            request: approvedRequest,
        });
    } catch (err) {
        console.error('Error in approveRequest:', err);
        return res.status(500).json({ message: 'Server error' });
    }
};

const rejectRequest = async (req, res) => {
    try {
        const { id } = req.params;
        if (!validateRequestId(id)) {
            return res.status(400).json({ message: 'Invalid requestId format.' });
        }

        const { adminReturnMessage } = req.body;

        const updateData = {
            issued: [],
            requestStatus: 'rejected',
            issuedDate: moment.tz("Asia/Kolkata").toDate()
        };

        if (adminReturnMessage) {
            updateData.adminReturnMessage = adminReturnMessage;
        }

        const updatedRequest = await Requests.findOneAndUpdate(
            { requestId: id },
            { $set: updateData },
            { new: true, runValidators: true }
        )
        .populate('userId', 'name email rollNo')
        .populate('referenceId', 'name email rollNo');

        if (!updatedRequest) {
            return res.status(404).json({ message: `Request with ID: ${id} doesn't exist.` });
        }

        const requestID = updatedRequest.requestId;
        const studentName = updatedRequest.userId.name;
        const studentEmail = updatedRequest.userId.email;
        const studentRollNo = updatedRequest.userId.rollNo.toUpperCase();
        const reason = adminReturnMessage || 'The request has been rejected by the admin';

        // Format the original request date
        const formattedRequestDate = moment(updatedRequest.requestDate)
            .tz("Asia/Kolkata")
            .format("DD/MM/YYYY HH:mm");

        // Notify reference (staff) if present
        if (updatedRequest.referenceId) {
            const referenceEmail = updatedRequest.referenceId.email;
            const referenceName = updatedRequest.referenceId.name;

            await sendStaffRejectEmail(referenceEmail, referenceName, studentRollNo, studentName, requestID, reason);
        }

        // Notify student (user)
        await sendUserRejectEmail(studentEmail, studentName, formattedRequestDate , requestID,reason );

        return res.status(200).json({
            status: 200,
            message: 'Request rejected successfully',
            request: updatedRequest,
        });
    } catch (err) {
        console.error('Error in rejectRequest:', err);
        return res.status(500).json({ message: 'Server error' });
    }
};
;

const fetchUserRequests = async (req, res) => {
    try {
        const { id: rollNo } = req.params;

        const user = await Users.findOne({ rollNo: rollNo });
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        const requests = await Requests.find({ userId: user._id })
            .populate('userId', 'name email rollNo')
            .populate('referenceId', 'name email rollNo');

        if (!requests) {
            return res.status(404).json({ message: 'No Request found' });
        }

        return res.status(200).json({
            status: 200,
            message: 'Requests fetched successfully',
            requests: requests
        });
    } catch (err) {
        console.error('Error in fetchUserRequests:', err);
        return res.status(500).json({ message: 'Server error' });
    }
};

const getUserRequests = async (req, res) => {
    try {
        const { rollNo } = req.body;

        const user = await Users.findOne({ rollNo: rollNo });
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        const requests = await Requests.find({ userId: user._id })
            .populate('userId', 'name email rollNo')
            .populate('referenceId', 'name email rollNo');

        if (!requests) {
            return res.status(404).json({ message: 'No Request found' });
        }

        return res.status(200).json({
            status: 200,
            message: 'Requests fetched successfully',
            requests: requests
        });
    } catch (err) {
        console.error('Error in getUserRequests:', err);
        return res.status(500).json({ message: 'Server error' });
    }
};

const fetchRefRequests = async (req, res) => {
    try {
        const { id: refId } = req.params;

        //Validate ID format
        if (!mongoose.Types.ObjectId.isValid(refId)) {
            return res.status(400).json({ message: 'Invalid reference ID' });
        }

        //Fetch request by ID and populate user references
        const requests = await Requests.find({ referenceId: refId })
            .populate('userId', 'name email rollNo')
            .populate('referenceId', 'name email rollNo');

        if (!requests) {
            return res.status(404).json({ message: 'No Request found' });
        }

        //Send request details
        return res.status(200).json({
            status: 200,
            message: 'Requests fetched successfully',
            requests: requests
        });
    } catch (err) {
        console.error('Error in fetchRefRequest:', err);
        return res.status(500).json({ message: 'Server error' });
    }
};

// const getRefRequests = async (req, res) => {
//     try {
//         const { refId } = req.body;
//         console.log(refId);
//         //Validate ID format
//         if (!mongoose.Types.ObjectId.isValid(refId)) {
//             return res.status(400).json({ message: 'Invalid request ID' });
//         }

//         //Fetch request by ID and populate user references
//         const requests = await Requests.find({ referenceId: refId })
//             .populate('userId', 'name email rollNo')
//             .populate('referenceId', 'name email rollNo');

//         if (!requests) {
//             return res.status(404).json({ message: 'No Request found' });
//         }

//         //Send request details
//         return res.status(200).json({
//             status: 200,
//             message: 'Requests fetched successfully',
//             requests: requests
//         });
//     } catch (err) {
//         console.error('Error in getRefRequest:', err);
//         return res.status(500).json({ message: 'Server error' });
//     }
// };

const fetchRequestByStatus = async (req, res) => {
    try {
        const { status } = req.query;

        let filter = {};

        if (status === 'pending') {
            filter.requestStatus = 'pending';
        } else if (status === 'non-pending') {
            filter.requestStatus = { $ne: 'pending' };
        } else {
            return res.status(400).json({ message: 'Invalid status value' });
        }

        const requests = await Requests.find(filter)
            .populate('userId', 'name email rollNo')
            .populate('referenceId', 'name email rollNo');

        return res.status(200).json({
            status: 200,
            message: `Requests fetched successfully`,
            requests,
        });
    } catch (err) {
        console.error('Error in fetchRequestByStatus:', err);
        return res.status(500).json({ message: 'Server error' });
    }
};

const collectProducts = async (req, res) => {
    try {
        const { id } = req.params;

        if (!validateRequestId(id)) {
            return res.status(400).json({ message: 'Invalid requestId format.' });
        }

        const request = await Requests.findOne({ requestId: id });
        if (!request) {
            return res.status(404).json({ message: `Request with requestId: ${id} doesn't exist.` });
        }

        if (request.requestStatus !== 'approved' && request.requestStatus !== 'reIssued') {
            return res.status(400).json({ message: 'Request is not in approved or reIssued status.' });
        }

        for (const item of request.issued) {
            await Products.findByIdAndUpdate(
                item.issuedProductId,
                {
                    $inc: {
                        yetToGive: -item.issuedQuantity,
                        inStock: -item.issuedQuantity
                    }
                }
            );
        }

        const updatedRequest = await Requests.findOneAndUpdate(
            { requestId: id },
            { $set: { collectedDate: moment.tz("Asia/Kolkata").toDate() } },
            { new: true, runValidators: true }
        )
        .populate('userId', 'name email rollNo')
        .populate('referenceId', 'name email rollNo');

        if (!updatedRequest) {
            return res.status(404).json({ message: `Request with requestId: ${id} doesn't exist.` });
        }


        try {
            const collectedDate = moment(updatedRequest.collectedDate).tz("Asia/Kolkata");
            const adminApprovedDays = updatedRequest.adminApprovedDays || 0;
            const returnDate = collectedDate.clone().add(adminApprovedDays, 'days').format('DD/MM/YYYY HH:mm');
            await updateRowbyReqID(
                updatedRequest.requestId,
                [
                    updatedRequest.requestId,
                    0,
                    'approved',
                    returnDate,
                    0
                ]
            );
        } catch (sheetErr) {
            console.error('Error updating Google Sheet:', sheetErr);
        }

        // Format collection date and due date in Asia/Kolkata
            const collectedMoment = moment(updatedRequest.collectedDate).tz("Asia/Kolkata");
            const collectionDateTime = collectedMoment.format("DD/MM/YYYY HH:mm");

            const adminApprovedDays = updatedRequest.adminApprovedDays || 0;
            const newDueDate = collectedMoment.clone().add(adminApprovedDays, 'days').format("DD/MM/YYYY");

            // Send email to user
            await sendUserCollectEmail(
            updatedRequest.userId.email,
            updatedRequest.userId.name,
            updatedRequest.requestId,
            collectionDateTime,
            newDueDate
            );


        return res.status(200).json({
            status: 200,
            message: 'Request updated successfully',
            request: updatedRequest,
        });

    } catch (err) {
        console.error('Error in collectProducts:', err);
        return res.status(500).json({ message: 'Server error' });
    }
};

const closeUncollectedRequests = async (req, res) => {
    try {
        const { id } = req.params;

        if (!validateRequestId(id)) {
            return res.status(400).json({ message: 'Invalid requestId format.' });
        }

        const request = await Requests.findOne({ requestId: id });
        if (!request) {
            return res.status(404).json({ message: `Request with requestId: ${id} doesn't exist.` });
        }

        if (request.requestStatus === 'closed') {
            return res.status(400).json({ message: 'Request is already closed.' });
        }

        if (request.requestStatus !== 'approved' && request.requestStatus !== 'reIssued') {
            return res.status(400).json({ message: 'Request is not in approved or reIssued status.' });
        }

        if (request.collectedDate !== null) {
            return res.status(400).json({ message: 'The products have already been collected.' });
        }

        for (const item of request.issued) {
            await Products.findByIdAndUpdate(
                item.issuedProductId,
                { $inc: { yetToGive: -item.issuedQuantity } }
            );
        }

        const updatedRequest = await Requests.findOneAndUpdate(
            { requestId: id },
            { $set: { AllReturnedDate: moment.tz("Asia/Kolkata").toDate(), requestStatus: 'closed' } },
            { new: true, runValidators: true }
        )
        .populate('userId', 'name email rollNo')
        .populate('referenceId', 'name email rollNo');

        if (!updatedRequest) {
            return res.status(404).json({ message: `Request with requestId: ${id} doesn't exist.` });
        }

        return res.status(200).json({
            status: 200,
            message: 'Request closed successfully',
            request: updatedRequest,
        });

    } catch (err) {
        console.error('Error in closeUncollectedRequests:', err);
        return res.status(500).json({ message: 'Server error' });
    }
}

const remainderMail = async (req, res) => {
    try {
        const { id } = req.params;

        if (!validateRequestId(id)) {
            return res.status(400).json({ message: 'Invalid requestId format.' });
        }

        const request = await Requests.findOne({ requestId: id });
        if (!request) {
            return res.status(404).json({ message: `Request with requestId: ${id} doesn't exist.` });
        }

        if (request.collectedDate === null) {
            return res.status(400).json({ message: 'The products have not been collected yet.' });
        }

        if (request.requestStatus !== 'approved' && request.requestStatus !== 'reIssued') {
            return res.status(400).json({ message: 'Request is not in approved or reIssued status.' });
        }

        const issuedDate = moment(request.collectedDate).tz("Asia/Kolkata");
        const dueDate = issuedDate.clone().add(request.adminApprovedDays, 'days');

        const currentDate = moment.tz("Asia/Kolkata");

        if (currentDate.isAfter(dueDate)) {
            return res.status(400).json({ message: 'Reminder can only be sent before the due date.' });
        }

        const user = await Users.findById(request.userId);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        await sendUserReminderEmail(user.email, user.name, request.requestId, issuedDate.format('DD-MM-YYYY'), dueDate.format('DD-MM-YYYY'));

        console.log(`Reminder email sent to ${user.email} for requestId: ${id}`);

        return res.status(200).json({
            status: 200,
            message: 'Reminder email sent successfully',
        });

    } catch (err) {
        console.error('Error in remainderMail:', err);
        return res.status(500).json({ message: 'Server error' });
    }
};

const delayMail = async (req, res) => {
    try {
        const { id } = req.params;

        if (!validateRequestId(id)) {
            return res.status(400).json({ message: 'Invalid requestId format.' });
        }

        const request = await Requests.findOne({ requestId: id });
        if (!request) {
            return res.status(404).json({ message: `Request with requestId: ${id} doesn't exist.` });
        }

        if (request.requestStatus !== 'approved' && request.requestStatus !== 'reIssued') {
            return res.status(400).json({ message: 'Request is not in approved status.' });
        }
        
        if (request.collectedDate === null) {
            return res.status(400).json({ message: 'The products not have been collected yet.' });
        }

        const issuedDate = moment(request.collectedDate).tz("Asia/Kolkata");
        const dueDate = issuedDate.clone().add(request.adminApprovedDays, 'days');

        const currentDate = moment.tz("Asia/Kolkata");

        if (currentDate.isAfter(dueDate)) {
            return res.status(400).json({ message: 'Delay can only be sent after the due date.' });
        }

        const user = await Users.findById(request.userId);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        await sendUserDelayEmail(user.email, user.name, request.requestId, issuedDate.format('DD-MM-YYYY'), dueDate.format('DD-MM-YYYY'));

        console.log(`Delay email sent to ${user.email} for requestId: ${id}`);

        return res.status(200).json({
            status: 200,
            message: 'Delay email sent successfully',
        });

    } catch (err) {
        console.error('Error in delayMail:', err);
        return res.status(500).json({ message: 'Server error' });
    }
};

module.exports = {
    addRequest,
    updateRequest,
    fetchRequest,
    fetchAllRequests,
    approveRequest,
    rejectRequest,
    fetchUserRequests,
    fetchRefRequests,
    fetchRequestByStatus,
    getUserRequests,
    collectProducts,
    updateProductRequest,
    closeUncollectedRequests,
    remainderMail,
    delayMail
};