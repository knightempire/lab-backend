const mongoose = require('mongoose');
const moment = require("moment-timezone");

const notificationSchema = new mongoose.Schema(
    {
        userId: [{
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true,
        }],
        
        message: {
            type: String,
            required: true,
        },
        
        notifyDate: {
            type: Date,
            required: true,
        },
        
        status: {
            type: String,
            enum: ['unread', 'read'],
            default: 'unread',
        },

        createdAt: {
            type: Date,
            default: () => moment.tz("Asia/Kolkata").toDate(),
        },
    }
);

const Notifications = mongoose.model('Notifications', notificationSchema);

module.exports = Notifications;