//controllers/product.controllers.js
const Products = require('../models/product.model');
const mongoose = require('mongoose');
const XLSX = require('xlsx');

//Function to add Product
const addProduct = async (req, res) => {
    try {
        let {name, quantity, damagedQuantity, inStock} = req.body;
        
        const requiredFields = ['name', 'quantity', 'damagedQuantity', 'inStock'];
        const missingFields = requiredFields.filter(field => req.body[field] === undefined);

        //Ensure all Fields are provided
        if (missingFields.length > 0) {
            return res.status(400).json({
                message: `Missing required fields: ${missingFields.join(', ')}`
            });
        }

        //Check if product already exists
        console.log('Checking if product already exists');
        name = name.trim().toLowerCase();
        const existingProduct = await Products.findOne({
            name: { $regex: new RegExp('^' + name + '$', 'i') }
        });
        if (existingProduct) {
            console.log('Product already exists:', name);
            return res.status(400).json({ message: 'Product already exists' });
        }

        //Create a new product instance
        console.log('Creating new product with name:', name);
        const newProduct = new Products({name, quantity, damagedQuantity, inStock});

        //Save the product to the database
        console.log('Saving new product to the database');
        await newProduct.save();
        console.log('Product saved successfully:', newProduct);
    
        //Send success response
        return res.status(201).json({
            status: 201,
            message: 'Product created successfully',
            component: {
                name: newProduct.name,
                quantity: newProduct.quantity,
                damagedQuantity: newProduct.damagedQuantity,
                inStock: newProduct.inStock,
            }
        });
    } catch (err) {
        console.error('Error in addProduct:', err);
        return res.status(500).json({ message: 'Server error' });
    }
};

//Function to add Products in bulk
const bulkUpload = async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ message: "No file uploaded" });
        }

        const workbook = XLSX.read(req.file.buffer, { type: "buffer" });
        const sheet = workbook.Sheets[workbook.SheetNames[0]];
        const rows = XLSX.utils.sheet_to_json(sheet);

        const requiredFields = ['id', 'name', 'quantity', 'damagedQuantity', 'inStock'];
        const missingColumns = requiredFields.filter(field => !Object.keys(rows[0] || {}).includes(field));
        if (missingColumns.length > 0) {
            return res.status(400).json({ message: `Missing required columns: ${missingColumns.join(', ')}` });
        }

        const created = [], updated = [];

        for (const row of rows) {
            const { name, quantity, damagedQuantity, inStock } = row;

            const existing = await Products.findOne({ name: { $regex: new RegExp('^' + normalized + '$', 'i') } });

            if (existing) {
                existing.name = name;
                existing.quantity = quantity;
                existing.damagedQuantity = damagedQuantity;
                existing.inStock = inStock;
                await existing.save();
                updated.push(id);
            } else {
                await Products.create({ _id: id, name, quantity, damagedQuantity, inStock });
                created.push(id);
            }
        }

        return res.status(200).json({
            message: "Bulk upload processed",
            created,
            updated
        });
    } catch (err) {
        console.error("Error in bulkUpload:", err);
        return res.status(500).json({ message: "Server error" });
    }
};

//Function to update product
const updateProduct = async (req, res) => {
    try {
        const { id } = req.params;

        //Validate ID format
        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({
                status: 400,
                message: 'Invalid product ID format',
            });
        }

        const fields = ['quantity', 'damagedQuantity', 'inStock', 'isDisplay'];
        const updates = {};

        for (let i of fields) {
            if (req.body[i] !== undefined) {
                updates[i] = req.body[i];
            }
        }

        const updatedProduct = await Products.findByIdAndUpdate(id, updates, { new: true, runValidators: true });

        if (!updatedProduct) {
            return res.status(404).json({ message: `Product with Id: ${id} doesn't exist.` });
        }

        return res.status(200).json({
            status: 200,
            message: 'Product updated successfully',
            product: updatedProduct,
        });
    } catch (err) {
        console.error('Error in updateProduct:', err);
        return res.status(500).json({ message: 'Server error' });
    }
}

//Function to display all products
const fetchAllProducts = async (req, res) => {
    try {
        //Fetch all Products
        const products = await Products.find();

        //No Product to display
        if (!products || products.length === 0) {
            return res.status(404).json({
                status: 404,
                message: 'No product to Display',
                components: products.map(product => ({
                    id: product._id,
                    name: product.name,
                    quantity: product.quantity,
                    damagedQuantity: product.damagedQuantity,
                    inStock: product.inStock
                })),
            });
        }

        //Send the products details
        return res.status(200).json({
            status: 200,
            message: 'Products fetched successfully',
            components: products.map(product => ({
                id: product._id,
                name: product.name,
                quantity: product.quantity,
                damagedQuantity: product.damagedQuantity,
                inStock: product.inStock
            })),
        });
    } catch (err) {
        console.error('Error in fetchAllProducts:', err);
        return res.status(500).json({ message: 'Server error' });
    }
};

//Function to display a product
const fetchProduct = async (req, res) => {
    try {
        const { id } = req.params;

        //Validate ID format
        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({
                status: 400,
                message: 'Invalid product ID format',
            });
        }

        //Fetch Product
        const product = await Products.findById(id);

        //Product not found
        if (!product) {
            return res.status(404).json({message: `Product with Id: ${id} doesn't exist.`});
        }

        //Send the product details
        return res.status(200).json({
            status: 200,
            message: 'Product fetched successfully',
            component: product,
        });
    } catch (err) {
        console.error('Error in fetchProduct:', err);
        return res.status(500).json({ message: 'Server error' });
    }
}

module.exports = { addProduct, updateProduct, fetchProduct, fetchAllProducts };