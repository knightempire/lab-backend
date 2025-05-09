// routes/users.js
const express = require('express');
const users = express.Router(); 
const { fetchAllUsers, fetchUser, updateUser } = require('../controllers/admin/users.controllers');

users.put('/update/:id', updateUser);
users.get('/get', fetchAllUsers);
users.get('/get/:id', fetchUser);

module.exports = users;