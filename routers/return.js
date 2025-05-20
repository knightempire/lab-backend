const express = require('express');
const Return = express.Router();
const { returnProducts, fetchReturn } = require('../controllers/return.controllers');

Return.post('/return/:id', returnProducts);
Return.get('/return/:id', fetchReturn);

module.exports = Return;