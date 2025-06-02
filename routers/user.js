// routes/users.js
const express = require('express');
const users = express.Router(); 
const { fetchAllUsers, adminFetchUser, adminUpdateUser } = require('../controllers/admin/users.controllers');
const { updateUser, fetchUser } = require('../controllers/profile.controllers');
const { admintokenValidator, tokenValidator } = require('../middleware/auth/tokenvalidate.js');

users.put('/update/:rollNo', admintokenValidator, adminUpdateUser);
users.get('/get', admintokenValidator, fetchAllUsers);
users.get('/get/:rollNo', admintokenValidator, adminFetchUser);
users.put('/update', tokenValidator, updateUser);
users.get('/get-user', tokenValidator, fetchUser);


module.exports = users;