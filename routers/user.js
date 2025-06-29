// routes/users.js
const express = require('express');
const users = express.Router(); 
const { fetchAllUsers, adminFetchUser, adminUpdateUser } = require('../controllers/admin/profile.controllers.js');
const { updateUser, fetchUser, userStats } = require('../controllers/profile.controllers');
const { admintokenValidator, tokenValidator } = require('../middleware/auth/tokenvalidate.js');

users.put('/update/:rollNo', admintokenValidator, adminUpdateUser);
users.get('/get', admintokenValidator, fetchAllUsers);
users.get('/get/:rollNo', admintokenValidator, adminFetchUser);
users.put('/update', tokenValidator, updateUser);
users.get('/get-user', tokenValidator, fetchUser);
users.get('/stats', tokenValidator, userStats);

module.exports = users;