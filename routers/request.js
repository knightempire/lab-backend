const express = require('express');
const request = express.Router(); 
const { addRequest, updateRequest, fetchRequest, fetchAllRequests, approveProducts, rejectRequest } = require('../controllers/requests.controllers');

request.post('/add', addRequest);
request.put('/update/:id', updateRequest);
request.get('/get', fetchAllRequests);
request.get('/get/:id', fetchRequest);
request.post('/approve/:id', approveRequest);
request.post('/reject/:id', rejectRequest);

module.exports = request;