// routes/users.js
const express = require('express');
const users = express.Router(); 
const { fetchAllUsers, adminFetchUser, fetchUser, updateUser } = require('../controllers/admin/users.controllers');
const { admintokenValidator, tokenValidator } = require('../middleware/auth/tokenvalidate.js');

users.put('/update/:id', tokenValidator, updateUser);
users.get('/get', admintokenValidator, fetchAllUsers);
users.get('/get-user', tokenValidator, fetchUser);
users.get('/get/:id', admintokenValidator, adminFetchUser);


module.exports = users;