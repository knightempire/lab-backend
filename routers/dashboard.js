const express = require('express');
const dashboard = express.Router();
const {
  getRequestStats,
    getOverdueReturns,
    getAdminReminder,
    getLowStockItems,
    getInventoryDistribution,
    getRequestCountByMonth,
    getTopComponents,

} = require('../controllers/admin/dashboard.controllers');
const { admintokenValidator } = require('../middleware/auth/tokenvalidate.js');

dashboard.get('/request-stats', admintokenValidator, getRequestStats);
dashboard.get('/overdue-returns', admintokenValidator, getOverdueReturns);
dashboard.get('/admin-reminder', admintokenValidator, getAdminReminder);
dashboard.get('/low-stock', admintokenValidator, getLowStockItems);
dashboard.get('/inventory-distribution', admintokenValidator, getInventoryDistribution);
dashboard.get('/request-count-by-month', admintokenValidator, getRequestCountByMonth);
dashboard.get('/top-components', admintokenValidator, getTopComponents);


module.exports = dashboard;
