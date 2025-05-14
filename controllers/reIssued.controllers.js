// Have updated request Schema to convert the request and issued date to date instead of array, and have modified the controllers accordingly have also added controllers for fetching request by status.

// Have created reIssued and have also created add, update and get controllers for it

const moment = require('moment-timezone');
const ReIssued = require('../models/reIssued.model'); // adjust path as needed

const addReIssued = async (req, res) => {
    try {
        const { requestId, requestedDays } = req.body;

        if (!requestId || !requestedDays) {
            return res.status(400).json({ message: 'Missing required fields' });
        }

        //Validate ID format
        if (!mongoose.Types.ObjectId.isValid(requestId)) {
            return res.status(400).json({
                message: 'Invalid request ID format',
            });
        }

        const newReIssued = new ReIssued({
            requestId,
            requestedDays
        });

        await newReIssued.save();

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