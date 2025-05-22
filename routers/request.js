const express = require('express');
const request = express.Router(); 
const { addRequest, updateRequest, fetchRequest, fetchAllRequests, approveRequest, rejectRequest, fetchUserRequests, fetchRefRequests, fetchRequestByStatus, getUserRequests} = require('../controllers/requests.controllers');
const { admintokenValidator, tokenValidator } = require('../middleware/auth/tokenvalidate.js');

request.post('/add', tokenValidator, addRequest);
request.put('/update/:id', tokenValidator, updateRequest);
request.get('/get', admintokenValidator, fetchAllRequests);
request.get('/user-get/:id', admintokenValidator, fetchUserRequests);
request.get('/ref-get/:id', admintokenValidator, fetchRefRequests);
request.get('/get/:id', tokenValidator, fetchRequest);
request.post('/approve/:id', admintokenValidator, approveRequest);
request.post('/reject/:id', admintokenValidator, rejectRequest);
request.get('/', admintokenValidator, fetchRequestByStatus);
request.get('/user', tokenValidator, getUserRequests);

module.exports = request;