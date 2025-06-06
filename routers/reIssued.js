const express = require('express');
const reIssued = express.Router(); 
const { addReIssued, updateReIssued, fetchAllReIssued, fetchReIssued, approveReIssued, rejectReIssued } = require('../controllers/reIssued.controllers');
const { admintokenValidator, tokenValidator } = require('../middleware/auth/tokenvalidate.js');

reIssued.post("/add/:requestId", tokenValidator, addReIssued);
reIssued.get("/get", admintokenValidator, fetchAllReIssued);
reIssued.get("/get/:id", tokenValidator, fetchReIssued);
reIssued.put("/update/:id", admintokenValidator, updateReIssued);
reIssued.put("/approve/:id", admintokenValidator, approveReIssued);
reIssued.put("/reject/:id", admintokenValidator, rejectReIssued);

module.exports = reIssued;