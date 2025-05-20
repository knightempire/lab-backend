const mongoose = require('mongoose');
const ReIssued = require('../models/reIssued.model');
const Requests = require('../models/requests.model');

const addReIssued = async (req, res) => {
    try {
        const { requestId, requestedDays, requestDescription } = req.body;

        if (!requestId || !requestedDays) {
            return res.status(400).json({ message: 'Missing required fields' });
        }

        //Validate ID format
        if (!mongoose.Types.ObjectId.isValid(requestId)) {
            return res.status(400).json({
                message: 'Invalid request ID format',
            });
        }

        //generate reIssuedId
        const request = await Requests.findById(requestId);
        if (!request) {
            return res.status(404).json({ message: 'Request not found' });
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

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({ message: 'Invalid reIssued ID' });
        }

        const updatedReIssued = await ReIssued.findByIdAndUpdate(id, req.body, { new: true, runValidators: true })
            .populate('requestId', 'userId requestedProducts');

        if (!updatedReIssued) {
            return res.status(404).json({ message: `reIssued with ID: ${id} doesn't exist.` });
        }

        return res.status(200).json({
            status: 200,
            message: 'reIssued updated successfully',
            reIssued: updatedReIssued,
        });
    } catch (err) {
        console.error('Error in updateReIssued:', error);
        return res.status(500).json({ message: 'Server error' });
    }
};

const fetchAllReIssued = async (req, res) => {
    try {
        const reIssued = await ReIssued.find()
            .populate('requestId', 'userId requestedProducts');

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

module.exports = { addReIssued, updateReIssued, fetchAllReIssued };