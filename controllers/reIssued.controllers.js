const ReIssued = require('../models/reIssued.model');
const Requests = require('../models/requests.model');
const moment = require('moment-timezone');

const requestIdRegex = /^REQ-[FS]-\d{2}\d{4}$/;

function validateRequestId(id) {
    return typeof id === 'string' && requestIdRegex.test(id);
}

function validateReIssuedId(id) {
    const reIssuedRegex = /^REQ-[FS]-\d{2}\d{4}-r\d+$/;
    return typeof id === 'string' && reIssuedRegex.test(id);
}

const addReIssued = async (req, res) => {
    try {
        const { requestId } = req.params;

        if (!validateRequestId(requestId)) {
            return res.status(400).json({ message: 'Invalid requestId format.' });
        }

        const { requestedDays, requestDescription } = req.body;

        if (!requestId || !requestedDays) {
            return res.status(400).json({ message: 'Missing required fields' });
        }

        const request = await Requests.findOne({ requestId });

        if (!request) {
            return res.status(404).json({ message: 'Request not found' });
        }

        if (request.requestStatus !== 'approved') {
            return res.status(400).json({ message: 'Request must be approved before reIssuing' });
        }

        const requestIdStr = request.requestId;

        const regex = new RegExp(`^${requestIdStr}-r\\d+$`);
        const existingCount = await ReIssued.countDocuments({ reIssuedId: { $regex: regex } });

        const newReIssuedId = `${requestIdStr}-r${existingCount + 1}`;

        const newReIssued = new ReIssued({
            reIssuedId: newReIssuedId,
            requestId,
            requestedDays,
            requestDescription
        });

        await newReIssued.save();

        request.reIssued.push(newReIssuedId);
        request.requestStatus = 'reIssued';

        await request.save();

        return res.status(201).json({
            status: 201,
            message: 'ReIssued created successfully',
            reIssued: newReIssued,
        });
    } catch (error) {
        console.error('Error in addReIssued:', error);
        return res.status(500).json({ message: 'Server error' });
    }
};

const updateReIssued = async (req, res) => {
    try {
        const { id } = req.params;

        if (!validateReIssuedId(id)) {
            return res.status(400).json({ message: 'Invalid reIssuedId format.' });
        }

        const updatedReIssued = await ReIssued.findOneAndUpdate(
            { reIssuedId: id },
            req.body,
            { new: true, runValidators: true }
        )

        if (!updatedReIssued) {
            return res.status(404).json({ message: `reIssued with ID: ${id} doesn't exist.` });
        }

        return res.status(200).json({
            status: 200,
            message: 'reIssued updated successfully',
            reIssued: updatedReIssued,
        });
    } catch (err) {
        console.error('Error in updateReIssued:', err);
        return res.status(500).json({ message: 'Server error' });
    }
};

const fetchAllReIssued = async (req, res) => {
    try {
        const reIssued = await ReIssued.find();

        if (!reIssued.length) {
            return res.status(404).json({
                message: 'No reIssued requests found'
            });
        }

        return res.status(200).json({
            status: 200,
            message: 'reIssued requests fetched successfully',
            reIssued: reIssued
        });
    } catch (err) {
        console.log('Error in fetchAllReIssued: ', err);
        res.status(500).json({message: "Server error"});
    }
};

const fetchReIssued = async (req, res) => {
    try {
        const { id } = req.params;

        if (!validateReIssuedId(id)) {
            return res.status(400).json({ message: 'Invalid reIssuedId format.' });
        }

        const reIssued = await ReIssued.findOne({ reIssuedId: id });

        if (!reIssued) {
            return res.status(404).json({ message: `reIssued with ID: ${id} doesn't exist.` });
        }

        return res.status(200).json({
            status: 200,
            message: 'ReIssued request fetched successfully',
            reIssued: reIssued,
        });
    } catch (error) {
        console.error('Error in fetchReIssued:', error);
        return res.status(500).json({ message: 'Server error' });
    }
};

const approveReIssued = async (req, res) => {
    try {
        const { id } = req.params;

        if (!validateReIssuedId(id)) {
            return res.status(400).json({ message: 'Invalid reIssuedId format.' });
        }

        const reIssued = await ReIssued.findOne({ reIssuedId: id });

        if (!reIssued) {
            return res.status(404).json({ message: `reIssued with ID: ${id} doesn't exist.` });
        }

        const { adminApprovedDays, adminReturnMessage } = req.body;

        if (!adminApprovedDays || !adminReturnMessage) {
            return res.status(400).json({ message: 'Missing required fields' });
        }

        if (reIssued.status !== 'pending') {
            return res.status(400).json({ message: `ReIssued request already ${reIssued.status}` });
        }

        if (adminApprovedDays <= 0) {
            return res.status(400).json({ message: 'Admin approved days must be greater than 0' });
        }

        reIssued.status = 'approved';
        reIssued.reviewedDate = moment.tz("Asia/Kolkata").toDate();
        reIssued.adminApprovedDays = adminApprovedDays;
        reIssued.adminReturnMessage = adminReturnMessage;

        const request = await Requests.findOne({ requestId: reIssued.requestId });

        if (!request) {
            return res.status(404).json({ message: 'Request not found' });
        }

        request.requestStatus = 'reIssued';

        await request.save();

        await reIssued.save();

        return res.status(200).json({
            status: 200,
            message: 'ReIssued approved successfully',
            reIssued: reIssued,
        });
    } catch (error) {
        console.error('Error in approveReIssued:', error);
        return res.status(500).json({ message: 'Server error' });
    }
};

const rejectReIssued = async (req, res) => {
    try {
        const { id } = req.params;

        if (!validateReIssuedId(id)) {
            return res.status(400).json({ message: 'Invalid reIssuedId format.' });
        }

        const reIssued = await ReIssued.findOne({ reIssuedId: id });

        if (!reIssued) {
            return res.status(404).json({ message: `reIssued with ID: ${id} doesn't exist.` });
        }

        if (reIssued.status !== 'pending') {
            return res.status(400).json({ message: `ReIssued request already ${reIssued.status}` });
        }

        reIssued.status = 'rejected';
        reIssued.reviewedDate = moment.tz("Asia/Kolkata").toDate();
        reIssued.adminReturnMessage = req.body.adminReturnMessage || 'Request rejected by admin';

        await reIssued.save();

        return res.status(200).json({
            status: 200,
            message: 'ReIssued rejected successfully',
            reIssued: reIssued,
        });
    } catch (error) {
        console.error('Error in rejectReIssued:', error);
        return res.status(500).json({ message: 'Server error' });
    }
};

module.exports = { addReIssued, updateReIssued, fetchAllReIssued, fetchReIssued, approveReIssued, rejectReIssued };