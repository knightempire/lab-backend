//controllers/users.controllers.js
const Users = require('../models/user.model');
const mongoose = require('mongoose');

//Function to update user
const updateUser = async (req, res) => {
    try {
        const { id } = req.params;

        //Validate ID format
        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({
                status: 400,
                message: 'Invalid user ID format',
            });
        }

        const fields = ['name', 'email', 'rollNo', 'phoneNo'];
        const updates = {};

        for (let i of fields) {
            if (req.body[i] !== undefined) {
                updates[i] = req.body[i];
            }
        }

        const updatedUser = await Users.findByIdAndUpdate(id, updates, { new: true, runValidators: true });

        if (!updatedUser) {
            return res.status(404).json({ message: `User with Id: ${id} doesn't exist.` });
        }

        return res.status(200).json({
            status: 200,
            message: 'User updated successfully',
            user: updatedUser,
        });
    } catch (err) {
        console.error('Error in updateUsers:', err);
        return res.status(500).json({ message: 'Server error' });
    }
}

//Function to display all users
const fetchAllUsers = async (req, res) => {
    try {
        //Fetch all Users
        const userData = await Users.find();

        let text = 'Users fetched successfully';

        //No user to display
        if (userData.length === 0) {
            text = 'No User data to Display';
        }

        //Send the Users details
        return res.status(200).json({
            status: 200,
            message: text,
            users: userData.map(user => ({
                id: user._id,
                name: user.name,
                email: user.email,
                rollNo: user.rollNo,
                phoneNo: user.phoneNo,
                isFaculty: user.isFaculty,
                isAdmin: user.isAdmin
            })),
        });
    } catch (err) {
        console.error('Error in fetchAllUsers:', err);
        return res.status(500).json({ message: 'Server error' });
    }
}

//Function to display a user
const fetchUser = async (req, res) => {
    try {
        const { id } = req.params;

        //Validate ID format
        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({
                status: 400,
                message: 'Invalid user ID format',
            });
        }

        //Fetch User
        const user = await Users.findById(id);

        //user not found
        if (!user) {
            return res.status(404).json({message: `User with Id: ${id} doesn't exist.`});
        }

        //Send the user details
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

module.exports = { updateUser, fetchUser, fetchAllUsers };