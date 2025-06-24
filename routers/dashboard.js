const express = require('express');
const dashboard = express.Router();
const {
  getRequestStats,
    getOverdueReturns,
    getAdminReminder,
getLowStockAndTopComponents,
    getRequestMonthAndInventoryStats,

} = require('../controllers/admin/dashboard.controllers');
const { admintokenValidator } = require('../middleware/auth/tokenvalidate.js');

dashboard.get('/request-stats', admintokenValidator, getRequestStats);
dashboard.get('/overdue-returns', admintokenValidator, getOverdueReturns);
dashboard.get('/admin-reminder', admintokenValidator, getAdminReminder);
dashboard.get('/components-stock', admintokenValidator, getLowStockAndTopComponents);
dashboard.get('/inventory-and-request-count', admintokenValidator, getRequestMonthAndInventoryStats);




module.exports = dashboard;
