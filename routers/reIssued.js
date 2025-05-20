const express = require('express');
const reIssued = express.Router(); 
const { addReIssued, updateReIssued, fetchAllReIssued } = require('../controllers/reIssued.controllers');
const { admintokenValidator, tokenValidator } = require('../middleware/auth/tokenvalidate.js');

reIssued.post("/add", tokenValidator, addReIssued);
reIssued.get("/get", admintokenValidator, fetchAllReIssued);
reIssued.put("/update/:id", admintokenValidator, updateReIssued);

module.exports = reIssued;