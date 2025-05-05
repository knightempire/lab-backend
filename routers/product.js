// routes/products.js
const express = require('express');
const product = express.Router(); 
const { addProduct, fetchAllProducts, fetchProduct } = require('../controllers/product.controllers');

product.post('/add', addProduct);
product.get('/get', fetchAllProducts);
product.get('/get/:name', fetchProduct);

module.exports = product;