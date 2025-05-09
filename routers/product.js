// routes/products.js
const express = require('express');
const product = express.Router(); 
const { addProduct, updateProduct, fetchAllProducts, fetchProduct } = require('../controllers/product.controllers');

product.post('/add', addProduct);
product.put('/update/:id', updateProduct);
product.get('/get', fetchAllProducts);
product.get('/get/:id', fetchProduct);

module.exports = product;