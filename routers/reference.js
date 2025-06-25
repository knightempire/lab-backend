const express = require('express');
const reference = express.Router();
const { addReference, updateReference, fetchReferences } = require('../controllers/reference.controllers');
const { admintokenValidator, tokenValidator } = require('../middleware/auth/tokenvalidate.js');

reference.post('/add', tokenValidator, addReference);
reference.put('/update/:id', admintokenValidator, updateReference);
reference.get('/get', tokenValidator, fetchReferences);

module.exports = reference;