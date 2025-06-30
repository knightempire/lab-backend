// routes/products.js
const express = require('express');
const product = express.Router(); 
const { addProduct, updateProduct, fetchAllProducts, fetchProduct, bulkUpdateProducts } = require('../controllers/product.controllers');
const { admintokenValidator, tokenValidator } = require('../middleware/auth/tokenvalidate.js');
const multer = require('multer');
const upload = multer({ storage: multer.memoryStorage() });

product.post('/add', admintokenValidator, addProduct);
// product.post('/bulkAdd', upload.single('file'),admintokenValidator, bulkAddProducts);
product.put('/update/:id', admintokenValidator, updateProduct);
product.get('/get', tokenValidator, fetchAllProducts);
product.get('/get/:id', tokenValidator, fetchProduct);
product.post('/bulkupdate',admintokenValidator, bulkUpdateProducts);

module.exports = product;