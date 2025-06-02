//controllers/profile.controllers.js
const Users = require('../models/user.model');

const updateUser = async (req, res) => {
    try {
        const { rollNo } = req.body;

        const fieldMap = {
            userName: 'name',
            userPhoneNo: 'phoneNo'
        };

        console.log(req.body);

        const updates = {};
        for (let key in fieldMap) {
            if (req.body[key] !== undefined) {
                updates[fieldMap[key]] = req.body[key];
            }
        }

        if (Object.keys(updates).length === 0) {
            return res.status(400).json({
                status: 400,
                message: 'No valid fields provided to update',
            });
        }

        const updatedUser = await Users.findOneAndUpdate(
            { rollNo },
            updates,
            { new: true, runValidators: true }
        );

        if (!updatedUser) {
            return res.status(404).json({ message: `User with rollNo: ${rollNo} doesn't exist.` });
        }

        return res.status(200).json({
            status: 200,
            message: 'User updated successfully',
            user: updatedUser,
        });
    } catch (err) {
        console.error('Error in updateUser:', err);
        return res.status(500).json({ message: 'Server error' });
    }
}

const fetchUser = async (req, res) => {
    try {
        const { rollNo } = req.body;

        const user = await Users.findOne({ rollNo });

        if (!user) {
            return res.status(404).json({ message: `User with rollNo: ${rollNo} doesn't exist.` });
        }

        return res.status(200).json({
            status: 200,
            message: 'User fetched successfully',
            user: user,
        });
    } catch (err) {
        console.error('Error in fetchUser:', err);
        return res.status(500).json({ message: 'Server error' });
    }
}

module.exports = { updateUser, fetchUser };