//controllers/damaged.controllers
const Damaged = require('../models/damaged.model');
const mongoose = require('mongoose');
const { createNotification } = require('../controllers/notification.controllers');

const addDamaged = async (req, res) => {
    try {
        const { requestId, productId, damagedQuantity } = req.body;
        
        //Validate ID format
        if (!mongoose.Types.ObjectId.isValid(requestId)) {
            return res.status(400).json({
                message: 'Invalid request ID format',
            });
        }

        if (!mongoose.Types.ObjectId.isValid(productId)) {
            return res.status(400).json({
                message: 'Invalid product ID format',
            });
        }

        if (damagedQuantity <= 0) {
            return res.status(400).json({
                message: 'Damaged Quantity must be atleast 1',
            });
        }

        //Create a new damaged instance
        console.log('Creating new damaged');
        const newDamaged = new Damaged({requestId, productId, damagedQuantity});

        //Save the damaged to the database
        console.log('Saving new damaged to the database');
        await newDamaged.save();
        console.log('Damaged saved successfully:', newDamaged);

        await createNotification({
            body: {
                type: 'damaged_product',
                title: 'New Damaged Product',
                message: `A new damaged product has been reported.\nProduct ID: ${productId}, Damaged Quantity: ${damagedQuantity}, Request ID: ${requestId}`,
                relatedItemId: newDamaged._id,
            }
        }, res);

        //Send success response
        return res.status(201).json({
            status: 201,
            message: 'Damaged created successfully',
            product: newDamaged
        });
    } catch (err) {
        console.log('Error in addDamaged: ', err);
        res.status(500).json({message: "Server error"});
    }
};

const updateDamaged = async (req, res) => {
    try {
        const { id } = req.params;

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({ message: 'Invalid request ID' });
        }

        const updatedDamaged = await Damaged.findByIdAndUpdate(id, req.body, { new: true, runValidators: true });

        if (!updatedDamaged) {
            return res.status(404).json({ message: `Damaged with ID: ${id} doesn't exist.` });
        }
        
        return res.status(200).json({
            status: 200,
            message: 'Damaged updated successfully',
            product: updatedDamaged,
        });
    } catch (err) {
        console.log('Error in updateDamaged: ', err);
        res.status(500).json({message: "Server error"});
    }
};

const fetchDamaged = async (req, res) => {
    try {
        //Fetch all damaged products
        const damagedProducts = await Damaged.find();

        //No damaged product to display
        if (!damagedProducts.length) {
            return res.status(404).json({
                message: 'No product found'
            });
        }

        //Send the product details
        return res.status(200).json({
            status: 200,
            message: 'Damaged products fetched successfully',
            products: damagedProducts
        });
    } catch (err) {
        console.log('Error in fetchDamaged: ', err);
        res.status(500).json({message: "Server error"});
    }
};

module.exports = { addDamaged, updateDamaged, fetchDamaged };