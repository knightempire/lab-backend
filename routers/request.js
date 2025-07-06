const express = require('express');
const request = express.Router(); 
const { addRequest, updateRequest, fetchRequest, fetchAllRequests, approveRequest, rejectRequest, 
    fetchUserRequests, fetchRefRequests, fetchRequestByStatus, getUserRequests, collectProducts, 
    updateProductRequest, closeUncollectedRequests, remainderMail, delayMail, fetchAllRequestsOptimal } = require('../controllers/requests.controllers');
const { admintokenValidator, tokenValidator } = require('../middleware/auth/tokenvalidate.js');

request.post('/add', tokenValidator, addRequest);
request.put('/update/:id', admintokenValidator, updateRequest);
request.get('/get', admintokenValidator, fetchAllRequests);
request.get('/user-get/:id', admintokenValidator, fetchUserRequests);
request.get('/ref-get/:id', admintokenValidator, fetchRefRequests);
request.get('/get/:id', tokenValidator, fetchRequest);
request.post('/approve/:id', admintokenValidator, approveRequest);
request.post('/reject/:id', admintokenValidator, rejectRequest);
request.get('/', admintokenValidator, fetchRequestByStatus);
request.get('/user', tokenValidator, getUserRequests);
request.post('/collect/:id', tokenValidator, collectProducts);
request.put('/update-product/:id', admintokenValidator, updateProductRequest);
request.put('/failed/:id', admintokenValidator, closeUncollectedRequests);
request.post('/reminder/:id', admintokenValidator, remainderMail);
request.post('/delay/:id', admintokenValidator, delayMail);

request.get('/get/optimal/:page', admintokenValidator, fetchAllRequestsOptimal);

module.exports = request;