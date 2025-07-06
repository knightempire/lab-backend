const express = require('express');
const request = express.Router();
const requestsController = require('../controllers/requests.controllers');
const { admintokenValidator, tokenValidator } = require('../middleware/auth/tokenvalidate.js');

request.post('/add', tokenValidator, requestsController.addRequest);
request.put('/update/:id', admintokenValidator, requestsController.updateRequest);
request.get('/get', admintokenValidator, requestsController.fetchAllRequests);
request.get('/get/optimal/:page', admintokenValidator, requestsController.fetchAllRequestsOptimal);
request.get('/user-get/:id', admintokenValidator, requestsController.fetchUserRequests);
request.get('/ref-get/:id', admintokenValidator, requestsController.fetchRefRequests);
request.get('/get-status', admintokenValidator, requestsController.fetchRequestByStatus);
request.post('/user-get-request', admintokenValidator, requestsController.getUserRequests);
request.post('/approve/:id', admintokenValidator, requestsController.approveRequest);
request.post('/reject/:id', admintokenValidator, requestsController.rejectRequest);
request.put('/collect/:id', admintokenValidator, requestsController.collectProducts);
request.put('/updateproduct/:id', admintokenValidator, requestsController.updateProductRequest);
request.put('/close/:id', admintokenValidator, requestsController.closeUncollectedRequests);
request.get('/remainder/:id', admintokenValidator, requestsController.remainderMail);
request.get('/delay/:id', admintokenValidator, requestsController.delayMail);

module.exports = request;