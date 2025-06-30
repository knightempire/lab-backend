const express = require('express');
const notification = express.Router();
const {
  getAllNotifications,
  markNotificationAsRead,
  markAllNotificationsAsRead,
} = require('../controllers/notification.controllers');
const { admintokenValidator } = require('../middleware/auth/tokenvalidate.js');

notification.get('/', admintokenValidator, getAllNotifications);
notification.put('/markAsRead/:id', admintokenValidator, markNotificationAsRead);
notification.put('/markAllAsRead', admintokenValidator, markAllNotificationsAsRead);

module.exports = notification;