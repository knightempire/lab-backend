const express = require('express');
const Return = express.Router();
const { returnProducts, fetchReturn } = require('../controllers/return.controllers');

Return.post('/return/:requestId', returnProducts);
Return.get('/return/:requestId', fetchReturn);

module.exports = Return;