// routes/users.js
const express = require('express');
const users = express.Router(); 
const { fetchAllUsers, fetchUser, updateUser } = require('../controllers/admin/users.controllers');
const { admintokenValidator } = require('../middleware/auth/tokenvalidate.js');

users.put('/update/:id', updateUser);
users.get('/get', admintokenValidator, fetchAllUsers);
users.get('/get/:id', fetchUser);

module.exports = users;