const express = require('express');
const request = express.Router(); 
const { addRequest, updateRequest, fetchRequest, fetchAllRequests, approveRequest, rejectRequest } = require('../controllers/requests.controllers');
const { admintokenValidator } = require('../middleware/auth/tokenvalidate.js');

request.post('/add', addRequest);
request.put('/update/:id', updateRequest);
request.get('/get', admintokenValidator, fetchAllRequests);
request.get('/get/:id', fetchRequest);
request.post('/approve/:id', admintokenValidator, approveRequest);
request.post('/reject/:id', admintokenValidator, rejectRequest);

module.exports = request;