const express = require('express');
const damaged = express.Router();
const { addDamaged, updateDamaged, fetchDamaged } = require('../controllers/damaged.controllers');
const { admintokenValidator } = require('../middleware/auth/tokenvalidate.js');

damaged.post('/add', admintokenValidator, addDamaged);
damaged.put('/update/:id', admintokenValidator, updateDamaged);
damaged.get('/get', admintokenValidator, fetchDamaged);

module.exports = damaged;