const express = require('express');
const dashboard = express.Router();
const {
    getTotalRequests,
    getActiveRequests,
    getPendingRequests,
    getOverdueReturns,
    getAdminReminder,
    getLowStockItems,
    getInventoryDistribution,
    getRequestCountByMonth,
    getTopComponents,
    getStatusBreakdown
} = require('../controllers/admin/dashboard.controllers');
const { admintokenValidator } = require('../middleware/auth/tokenvalidate.js');

dashboard.get('/total-requests', admintokenValidator, getTotalRequests);
dashboard.get('/active-requests', admintokenValidator, getActiveRequests);
dashboard.get('/pending-requests', admintokenValidator, getPendingRequests);
dashboard.get('/overdue-returns', admintokenValidator, getOverdueReturns);
dashboard.get('/admin-reminder', admintokenValidator, getAdminReminder);
dashboard.get('/low-stock', admintokenValidator, getLowStockItems);
dashboard.get('/inventory-distribution', admintokenValidator, getInventoryDistribution);
dashboard.get('/request-count-by-month', admintokenValidator, getRequestCountByMonth);
dashboard.get('/top-components', admintokenValidator, getTopComponents);
dashboard.get('/status-breakdown', admintokenValidator, getStatusBreakdown);

module.exports = dashboard;
