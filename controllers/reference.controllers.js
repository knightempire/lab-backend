//controllers/reference.controllers.js
const Reference = require('../models/reference.model');
const mongoose = require('mongoose');

//Function to add reference
const addReference = async (req, res) => {
    try {
        let { name, email } = req.body;

        //Ensure all Fields are provided
        if (!name) {
            return res.status(400).json({ message: 'Name is an required field'});
        }if (!email) {
            return res.status(400).json({ message: 'Email is an required field'});
        }

        const emailRegex = /^\S+@\S+\.\S+$/;
        if (!emailRegex.test(email)) {
            return res.status(400).json({ message: 'Invalid email format'});
        }

        //Check if reference already exists
        console.log('Checking if reference already exists');
        const existingReference = await Reference.findOne({ email });
        if (existingReference) {
            console.log('Reference already exists:', name);
            return res.status(400).json({ message: 'Reference already exists' });
        }

        //Create a new reference instance
        console.log('Creating new reference with name:', name);
        const newReference = new Reference({name, email});

        //Save the reference to the database
        console.log('Saving new reference to the database');
        await newReference.save();
        console.log('Reference saved successfully:', newReference);
    
        //Send success response
        return res.status(201).json({
            status: 201,
            message: 'Reference created successfully',
            reference: {
                name: newReference.name,
                email: newReference.email,
            }
        });
    } catch (err) {
        console.error('Error in addReference:', err);
        return res.status(500).json({ message: 'Server error' });
    }
};

const updateReference = async (req, res) => {
    try {
        const { id } = req.params;

        //Validate ID format
        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({
                status: 400,
                message: 'Invalid reference ID format',
            });
        }

        const fields = ['name', 'email'];
        const updates = {};

        for (let i of fields) {
            if (req.body[i] !== undefined) {
                updates[i] = req.body[i];
            }
        }

        if (updates.email) {
            const duplicate = await Reference.findOne({ email: updates.email, _id: { $ne: id } });
            if (duplicate) {
                return res.status(400).json({ message: 'Email already exists in another reference'});
            }
        }

        const updatedReference = await Reference.findByIdAndUpdate(id, updates, { new: true, runValidators: true });

        if (!updatedReference) {
            return res.status(404).json({ message: `Reference with Id: ${id} doesn't exist.` });
        }

        return res.status(200).json({
            status: 200,
            message: 'Reference updated successfully',
            reference: updatedReference,
        });
    } catch (err) {
        console.error('Error in updateReference:', err);
        return res.status(500).json({ message: 'Server error' });
    }
};

const fetchReferences = async (req, res) => {
    try {
        const references = await Reference.find();

        //No Reference to display
        if (!references || references.length === 0) {
            return res.status(404).json({
                status: 404,
                message: 'No reference to Display'
            });
        }

        //Send the references details
        return res.status(200).json({
            status: 200,
            message: 'References fetched successfully',
            references: references.map(reference => ({
                id: reference._id,
                name: reference.name,
                email: reference.email
            })),
        });
    } catch (err) {
        console.error('Error in fetchReference:', err);
        return res.status(500).json({ message: 'Server error' });
    }
};

module.exports = { addReference, updateReference, fetchReferences };