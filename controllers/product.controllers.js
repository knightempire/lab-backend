//controllers/product.controllers.js
const Products = require('../models/product.model');
const mongoose = require('mongoose');
const XLSX = require('xlsx');
const { createNotification } = require('../controllers/notification.controllers');

//Function to add Product
const addProduct = async (req, res) => {
    try {
        let {product_name, quantity, damagedQuantity, inStock} = req.body;
        
        const requiredFields = ['product_name', 'quantity', 'damagedQuantity', 'inStock'];
        const missingFields = requiredFields.filter(field => req.body[field] === undefined);
        //Ensure all Fields are provided
        if (missingFields.length > 0) {
            return res.status(400).json({
                message: `Missing required fields: ${missingFields.join(', ')}`
            });
        }
        //Check if product already exists
        console.log('Checking if product already exists');
        product_name = product_name.trim().toLowerCase();
        const existingProduct = await Products.findOne({
            product_name: { $regex: new RegExp('^' + product_name + '$', 'i') }
        });
        if (existingProduct) {
            console.log('Product already exists:', product_name);
            return res.status(400).json({ message: 'Product already exists' });
        }
        //Create a new product instance
        console.log('Creating new product with product_name:', product_name);
        const newProduct = new Products({product_name, quantity, damagedQuantity, inStock});
        //Save the product to the database
        console.log('Saving new product to the database');
        await newProduct.save();
        console.log('Product saved successfully:', newProduct);

        // await createNotification({
        //     body: {type: 'new_product',
        //     title: 'New Product Added',
        //     message: `A new product has been added.\nProduct Name: ${product_name}, Quantity: ${quantity}, Damaged Quantity: ${damagedQuantity}, In Stock: ${inStock}`,
        //     relatedItemId: newProduct._id,}
        // }, { status: () => ({ json: () => {} }) });
    
        //Send success response
        return res.status(201).json({
            status: 201,
            message: 'Product created successfully',
            component: newProduct
        });
    } catch (err) {
        console.error('Error in addProduct:', err);
        return res.status(500).json({ message: 'Server error' });
    }
};

//Function to add Products in bulk
// const bulkAddProducts = async (req, res) => {
//     try {
//         if (!req.file) {
//             return res.status(400).json({ message: "No file uploaded" });
//         }
//         const workbook = XLSX.read(req.file.buffer, { type: "buffer" });
//         const sheet = workbook.Sheets[workbook.SheetNames[0]];
//         const rows = XLSX.utils.sheet_to_json(sheet);
//         const requiredFields = ['product_name', 'quantity', 'damagedQuantity', 'inStock'];
//         const missingColumns = requiredFields.filter(field => !Object.keys(rows[0] || {}).includes(field));
//         if (missingColumns.length > 0) {
//             return res.status(400).json({ message: `Missing required columns: ${missingColumns.join(', ')}` });
//         }
//         const fields = Object.keys(rows[0] || {});
//         for (let i = 0; i < requiredFields.length; i++) {
//             if (fields[i] !== requiredFields[i]) {
//                 return res.status(400).json({ message: `Invalid column order. Expected order: ${requiredFields.join(', ')}` });
//             }
//         }
//         const created = [], updated = [];
//         for (const row of rows) {
//             const { product_name, quantity, damagedQuantity, inStock } = row;
//             const existing = await Products.findOne({ product_name: { $regex: new RegExp('^' + product_name + '$', 'i') } });
//             if (existing) {
//                 existing.quantity = quantity;
//                 existing.damagedQuantity = damagedQuantity;
//                 existing.inStock = inStock;
//                 await existing.save();
//                 updated.push(product_name);
//             } else {
//                 const newProduct = await Products.create({ product_name, quantity, damagedQuantity, inStock });
//                 created.push(newProduct.product_name);
//             }
//         }

        // await createNotification({
        //     body: {type: 'new_products_uploaded',
        //     title: 'New Products Added using Bulk Upload',
        //     message: `new products have been added.`,
        //     relatedItemId: newProduct._id,}
        // }, { status: () => ({ json: () => {} }) });

//         return res.status(200).json({
//             message: "Bulk added Successfully",
//             created,
//             updated
//         });
//     } catch (err) {
//         console.error("Error in bulkAddProducts:", err);
//         return res.status(500).json({ message: "Server error" });
//     }
// };


const bulkUpdateProducts = async (req, res) => {
  try {
    const products = req.body.products;
    if (!Array.isArray(products) || products.length === 0) {
      return res.status(400).json({ message: 'No products provided' });
    }

    // Validate all products
    const requiredFields = ['product_name', 'quantity', 'damagedQuantity', 'inStock'];
    const missing = products.filter(
      p => requiredFields.some(field => p[field] === undefined)
    );
    if (missing.length > 0) {
      return res.status(400).json({ message: 'Some products are missing required fields' });
    }

    const results = {
      updated: [],
      inserted: []
    };

    for (const p of products) {
      const name = p.product_name.trim().toLowerCase();
      const incData = {
        quantity: p.quantity,
        damagedQuantity: p.damagedQuantity,
        inStock: p.inStock
      };

      const existing = await Products.findOne({ product_name: name });
      if (existing) {
        // Increment existing product values
        await Products.updateOne(
          { product_name: name },
          { $inc: incData }
        );
        results.updated.push(name);
      } else {
        // Insert new product
        const newProduct = await Products.create({
          product_name: name,
          ...incData
        });
        results.inserted.push(newProduct.product_name);
      }
    }

    return res.status(200).json({
      status: 200,
      message: 'Bulk update (sum) completed',
      ...results
    });
  } catch (err) {
    console.error('Error in bulkUpdateProducts:', err);
    return res.status(500).json({ message: 'Server error' });
  }
};


//Function to update product
const updateProduct = async (req, res) => {
    try {
        console.log('Updating product with ID:', req.params.id);
        const { id } = req.params;
        //Validate ID format
        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({
                status: 400,
                message: 'Invalid product ID format',
            });
        }
        const fields = ['product_name' ,'quantity', 'damagedQuantity', 'inStock', 'isDisplay'];
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

        // await createNotification({
        //     body: {type: 'stock_updated',
        //     title: 'Product Stock Updated',
        //     message: `Product stock has been updated.\nProduct ID: ${id}, Updated Fields: ${Object.keys(updates).join(', ')}`,
        //     relatedItemId: updatedProduct._id,}
        // }, { status: () => ({ json: () => {} }) });

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
                products: {},
            });
        }

        //Send the products details
        return res.status(200).json({
            status: 200,
            message: 'Products fetched successfully',
            products: products.map(product => ({
                product
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
module.exports = { addProduct, updateProduct, fetchProduct, fetchAllProducts, bulkUpdateProducts };
