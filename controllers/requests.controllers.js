//controllers/requests.controllers.js
const Requests = require('../models/requests.model');
const Users = require('../models/user.model');
const mongoose = require('mongoose');
const moment = require("moment-timezone");

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
            requestedProducts
        } = req.body;

        // Required fields check
        const requiredFields = ['userid', 'referenceId', 'description', 'requestedDays', 'requestedProducts'];
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

        const requestUserId = userid;
        const user = await Users.findById(requestUserId);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        const requestId = await generateRequestId(user.isFaculty);

        // Prepare requestData with required fields
        const requestData = {
            requestId,
            userId: requestUserId,
            referenceId,
            description,
            requestedDays,
            requestedProducts
        };

        // Create a new request instance
        const newRequest = new Requests(requestData);

        // Save the request to the database
        await newRequest.save();

        const populatedRequest = await Requests.findById(newRequest._id)
            .populate('userId', 'name email rollNo')
            .populate('referenceId', 'name email rollNo')
            .populate('requestedProducts.productId', 'product_name');

        // Formating the response
        const responseData = {
            requestId: populatedRequest.requestId,
            user: {
                name: populatedRequest.userId.name,
                email: populatedRequest.userId.email,
                rollNo: populatedRequest.userId.rollNo
            },
            reference: {
                name: populatedRequest.referenceId.name,
                email: populatedRequest.referenceId.email,
                rollNo: populatedRequest.referenceId.rollNo
            },
            description: populatedRequest.description,
            requestedDays: populatedRequest.requestedDays,
            requestedProducts: populatedRequest.requestedProducts.map(item => ({
                productName: item.productId ? item.productId.product_name : null,
                quantity: item.quantity
            })),
            requestDate: populatedRequest.requestDate,
            requestStatus: populatedRequest.requestStatus
        };

        // Send success response
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

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({ message: 'Invalid request ID' });
        }

        const fields = [
            'description',
            'requestedDays',
            'requestedProducts'
        ];

        const updates = {};
        for (let i of fields) {
            if (req.body[i] !== undefined) {
                updates[i] = req.body[i];
            }
        }

        // Validate requestedProducts if present
        if (updates.requestedProducts) {
            if (!Array.isArray(updates.requestedProducts) || updates.requestedProducts.length === 0) {
                return res.status(400).json({ message: 'requestedProducts must be a non-empty array' });
            }
            for (const prod of updates.requestedProducts) {
                if (
                    !prod.productId ||
                    !mongoose.Types.ObjectId.isValid(prod.productId) ||
                    typeof prod.quantity !== 'number' ||
                    prod.quantity < 1
                ) {
                    return res.status(400).json({
                        message: 'Each requestedProduct must have a valid productId and a positive quantity'
                    });
                }
            }
        }

        const updatedRequest = await Requests.findByIdAndUpdate(id, {
                $set: updates
            }, { new: true, runValidators: true })
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

const fetchAllRequests = async (req, res) => {
    try {
        //Fetch all requests and populate user references
        const requests = await Requests.find()
            .populate('userId', 'name email rollNo')
            .populate('referenceId', 'name email rollNo');

        //No Request to display
        if (!requests || requests.length === 0) {
            return res.status(404).json({
                status: 404,
                message: 'No requests found'
            });
        }

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
        
   

        //Fetch request by ID and populate user references
        const request = await Requests.findOne({ requestId: id })
            .populate('userId', 'name email rollNo')
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

        // Validate ID format
        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({ message: 'Invalid request ID' });
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

        const updateData = {
            issued,
            issuedDate: moment.tz("Asia/Kolkata").toDate(),
            requestStatus: 'approved',
            adminApprovedDays: adminApprovedDays,
            scheduledCollectionDate: moment.tz(scheduledCollectionDate, "Asia/Kolkata").toDate()
        };

        if (adminReturnMessage) {
            updateData.adminReturnMessage = adminReturnMessage;
        }

        const approvedRequest = await Requests.findByIdAndUpdate(
            id,
            {
                $set: updateData
            },
            { new: true, runValidators: true }
        )
        .populate('userId', 'name email rollNo')
        .populate('referenceId', 'name email rollNo');

        if (!approvedRequest) {
            return res.status(404).json({ message: `Request with ID: ${id} doesn't exist.` });
        }

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

        // Validate ID format
        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({ message: 'Invalid request ID' });
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

        const updatedRequest = await Requests.findByIdAndUpdate(
            id,
            {
                $set: updateData,
            },
            { new: true, runValidators: true }
        )
        .populate('userId', 'name email rollNo')
        .populate('referenceId', 'name email rollNo');

        if (!updatedRequest) {
            return res.status(404).json({ message: `Request with ID: ${id} doesn't exist.` });
        }

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

const fetchUserRequests = async (req, res) => {
    try {
        const { id: userId } = req.params;

        //Validate ID format
        if (!mongoose.Types.ObjectId.isValid(userId)) {
            return res.status(400).json({ message: 'Invalid request ID' });
        }

        //Fetch request by ID and populate user references
        const requests = await Requests.find({ userId: userId })
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
        console.error('Error in fetchUserRequest:', err);
        return res.status(500).json({ message: 'Server error' });
    }
};

const getUserRequests = async (req, res) => {
    try {
        const { userid } = req.body;
        console.log(userid);
        //Validate ID format
        if (!mongoose.Types.ObjectId.isValid(userid)) {
            return res.status(400).json({ message: 'Invalid request ID' });
        }

        //Fetch request by ID and populate user references
        const requests = await Requests.find({ userId: userid })
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
        console.error('Error in getUserRequest:', err);
        return res.status(500).json({ message: 'Server error' });
    }
};

const fetchRefRequests = async (req, res) => {
    try {
        const { id: refId } = req.params;

        //Validate ID format
        if (!mongoose.Types.ObjectId.isValid(refId)) {
            return res.status(400).json({ message: 'Invalid request ID' });
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

        // Validate ID format
        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({ message: 'Invalid request ID' });
        }

        const updatedRequest = await Requests.findByIdAndUpdate(id, {
                $set: {collectedDate: moment.tz("Asia/Kolkata").toDate()}
            }, { new: true, runValidators: true })
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
        console.error('Error in collectProducts:', err);
        return res.status(500).json({ message: 'Server error' });
    }
}

module.exports = { addRequest, updateRequest, fetchRequest, fetchAllRequests, approveRequest, rejectRequest, fetchUserRequests, fetchRefRequests, fetchRequestByStatus, getUserRequests, collectProducts };