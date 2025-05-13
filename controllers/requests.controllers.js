//controllers/requests.controllers.js
const Requests = require('../models/requests.model');
const mongoose = require('mongoose');

const addRequest = async (req, res) => {
    try {
        let {
            userId,
            referenceId,
            description,
            requestDate,
            requestedDays,
            requestedProducts,
            issued,
            issuedDate,
            adminReturnMessage,
            isAllReturned,
            requestStatus
        } = req.body;

        //Required fields check
        const requiredFields = ['userId', 'referenceId', 'description', 'requestedDays', 'requestedProducts'];
        const missingFields = requiredFields.filter(field => req.body[field] === undefined);

        if (missingFields.length > 0) {
            return res.status(400).json({
                message: `Missing required fields: ${missingFields.join(', ')}`
            });
        }

        //Prepare requestData with required fields
        const requestData = {
            userId,
            referenceId,
            description,
            requestedDays,
            requestedProducts
        };

        if (requestDate) requestData.requestDate = [requestDate];
        if (issued) requestData.issued = issued;
        if (issuedDate) requestData.issuedDate = [issuedDate];
        if (adminReturnMessage) requestData.adminReturnMessage = adminReturnMessage;
        if (isAllReturned !== undefined) requestData.isAllReturned = isAllReturned;
        if (requestStatus) requestData.requestStatus = requestStatus;

        //Create a new request instance
        console.log('Creating new request');
        const newRequest = new Requests(requestData);

        //Save the request to the database
        console.log('Saving new request to the database');
        await newRequest.save();
        console.log('Request saved successfully:', newRequest);

        //Send success response
        return res.status(201).json({
            status: 201,
            message: 'Request created successfully',
            request: newRequest
        });
    } catch (err) {
        console.error('Error in addRequest:', err);
        return res.status(500).json({ message: 'Server error' });
    }
};

const updateRequest = async (req, res) => {
    try {
        const {id} = req.params;

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({ message: 'Invalid request ID' });
        }
        
        const fields = [
            'description',
            'requestedDays',
            'requestedProducts',
            'isAllReturned'
        ];

        const updates = {};
        for (let i of fields) {
            if (req.body[i] !== undefined) {
                updates[i] = req.body[i];
            }
        }

        const updatedRequest = await Requests.findByIdAndUpdate(id, {
                $set: updates,
                $push: { requestDate: req.body['requestDate'] }
            }, { new: true, runValidators: true })
            .populate('userId', 'name email rollno')
            .populate('referenceId', 'name email rollno');

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
            .populate('userId', 'name email rollno')
            .populate('referenceId', 'name email rollno');

        //No Request to display
        if (!requests || requests.length === 0) {
            return res.status(404).json({
                status: 404,
                message: 'No requests found'
            });
        }

        const formattedRequests = requests.map(req => {
            const latestRequestDate = req.requestDate?.[req.requestDate.length - 1] || null;
            const latestIssuedDate = req.issuedDate?.[req.issuedDate.length - 1] || null;

            return {
                ...req._doc,
                requestDate: latestRequestDate,
                issuedDate: latestIssuedDate
            };
        });

        //Send the request details
        return res.status(200).json({
            status: 200,
            message: 'Requests fetched successfully',
            requests: formattedRequests
        });
    } catch (err) {
        console.error('Error in fetchAllRequest:', err);
        return res.status(500).json({ message: 'Server error' });
    }
};

const fetchRequest = async (req, res) => {
    try {
        const { id } = req.params;

        //Validate ID format
        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({ message: 'Invalid request ID' });
        }

        //Fetch request by ID and populate user references
        const request = await Requests.findById(id)
            .populate('userId', 'name email rollno')
            .populate('referenceId', 'name email rollno');

        if (!request) {
            return res.status(404).json({ message: 'Request not found' });
        }

        const latestRequestDate = request.requestDate?.[request.requestDate.length - 1] || null;
        const latestIssuedDate = req.issuedDate?.[req.issuedDate.length - 1] || null;
        const formattedRequest = {
            ...request._doc,
            requestDate: latestRequestDate,
            issuedDate: latestIssuedDate
        };

        //Send request details
        return res.status(200).json({
            status: 200,
            message: 'Request fetched successfully',
            request: formattedRequest
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

        const { issued, issuedDate, issuedDescription } = req.body;

        if (!Array.isArray(issued) || issued.length === 0) {
            return res.status(400).json({ message: 'Issued must be a non-empty array' });
        }

        for (const item of issued) {
            if (!item.issuedProduct || typeof item.issuedQuantity !== 'number') {
                return res.status(400).json({
                    message: 'Each issued item must contain "issuedProduct" and a numeric "issuedQuantity"'
                });
            }
        }

        const updateData = {
            issued,
            requestStatus: 'approved'
        };

        if (issuedDescription) {
            updateData.issuedDescription = issuedDescription;
        }

        const approvedRequest = await Requests.findByIdAndUpdate(
            id,
            {
                $set: updateData,
                $push: { issuedDate: issuedDate ? new Date(issuedDate) : new Date() }
            },
            { new: true, runValidators: true }
        )
        .populate('userId', 'name email rollno')
        .populate('referenceId', 'name email rollno');


        if (!approvedRequest) {
            return res.status(404).json({ message: `Request with ID: ${id} doesn't exist.` });
        }

        return res.status(200).json({
            status: 200,
            message: 'Request approved successfully',
            request: approvedRequest,
        });
    } catch (err) {
        console.error('Error in :', err);
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

        const { issuedDate, issuedDescription } = req.body;

        const updateData = {
            issued: [],
            requestStatus: 'rejected'
        };

        if (issuedDescription) {
            updateData.issuedDescription = issuedDescription;
        }

        const updatedRequest = await Requests.findByIdAndUpdate(
            id,
            {
                $set: updateData,
                $push: { issuedDate: issuedDate ? new Date(issuedDate) : new Date() }
            },
            { new: true, runValidators: true }
        )
        .populate('userId', 'name email rollno')
        .populate('referenceId', 'name email rollno');

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
            .populate('userId', 'name email rollno')
            .populate('referenceId', 'name email rollno');

        if (!requests) {
            return res.status(404).json({ message: 'No Request found' });
        }

        const formattedRequests = requests.map(req => {
            const latestRequestDate = req.requestDate?.[req.requestDate.length - 1] || null;
            const latestIssuedDate = req.issuedDate?.[req.issuedDate.length - 1] || null;

            return {
                ...req._doc,
                requestDate: latestRequestDate,
                issuedDate: latestIssuedDate
            };
        });

        //Send request details
        return res.status(200).json({
            status: 200,
            message: 'Requests fetched successfully',
            requests: formattedRequests
        });
    } catch (err) {
        console.error('Error in fetchUserRequest:', err);
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
            .populate('userId', 'name email rollno')
            .populate('referenceId', 'name email rollno');

        if (!requests) {
            return res.status(404).json({ message: 'No Request found' });
        }

        const formattedRequests = requests.map(req => {
            const latestRequestDate = req.requestDate?.[req.requestDate.length - 1] || null;
            const latestIssuedDate = req.issuedDate?.[req.issuedDate.length - 1] || null;

            return {
                ...req._doc,
                requestDate: latestRequestDate,
                issuedDate: latestIssuedDate
            };
        });

        //Send request details
        return res.status(200).json({
            status: 200,
            message: 'Requests fetched successfully',
            requests: formattedRequests
        });
    } catch (err) {
        console.error('Error in fetchRefRequest:', err);
        return res.status(500).json({ message: 'Server error' });
    }
};

module.exports = { addRequest, updateRequest, fetchRequest, fetchAllRequests, approveRequest, rejectRequest, fetchUserRequests, fetchRefRequests };