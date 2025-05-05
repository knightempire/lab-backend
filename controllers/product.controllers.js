// controllers/product.controllers.js
const { default: Components } = require('../models/component.model');

//Function to add Product
const addProduct = async (req, res) => {
    try {
        const {name, quantity, damagedQuantity, inStock} = req.body;
        
        const requiredFields = ['name', 'quantity', 'damagedQuantity', 'inStock'];
        const missingFields = requiredFields.filter(field => req.body[field] === undefined);

        //Ensure all Fields are provided
        if (missingFields.length > 0) {
            return res.status(400).json({
                message: `Missing required fields: ${missingFields.join(', ')}`
            });
        }

        // Check if product already exists
        console.log('Checking if product already exists');
        const existingProduct = await Components.findOne({ name });
        if (existingProduct) {
            console.log('product already exists:', name);
            return res.status(400).json({ message: 'product already exists' });
        }

        // Create a new product instance
        console.log('Creating new product with name:', name);
        const newProduct = new Components({name, quantity, damagedQuantity, inStock});

        // Save the product to the database
        console.log('Saving new product to the database');
        await newProduct.save();
        console.log('Product saved successfully:', newProduct);
    
        // Send success response
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

//Function to display all products
const fetchAllProducts = async (req, res) => {
    try {
        //Fetch all Products
        const products = await Components.find();

        let text = 'Products fetched successfully';

        //No Product to display
        if (products.length === 0) {
            text = 'No product to Display';
        }

        //Send the products details
        return res.status(200).json({
            status: 200,
            message: text,
            components: products,
        });
    } catch (err) {
        console.error('Error in fetchAllProducts:', err);
        return res.status(500).json({ message: 'Server error' });
    }
};

//Function to display a product
const fetchProduct = async (req, res) => {
    try {
        const name = req.query.name;

        //Ensure product name is provided
        if (!name) {
            return res.status(400).json({message: "name of the product is required."})
        }

        //Fetch Product
        const product = await Components.findOne({ name });

        //Product not found
        if (!product) {
            return res.status(404).json({message: `${name} doesn't exist.`});
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

module.exports = { addProduct, fetchProducts: fetchAllProducts, fetchProduct };