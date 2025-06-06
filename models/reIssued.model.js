const mongoose = require("mongoose");
const moment = require("moment-timezone");

const reIssuedSchema = new mongoose.Schema(
    {
        reIssuedId: {
            type: String,
            required: true,
            unique: true
        },
        
        requestId: {
            type: String,
            ref: "Requests",
            required: true
        },

        requestedDays: {
            type: Number,
            required: true
        },

        requestDescription: {
            type: String,
            default: null
        },

        adminReturnMessage: {
            type: String,
            default: null
        },

        reviewedDate: {
            type: Date,
            default: null
        },

        reIssuedDate: {
            type: Date,
            default: () => moment.tz("Asia/Kolkata").toDate()
        },

        adminApprovedDays: {
            type: Number,
            default: null
        },

        status: {
            type: String,
            enum: ["approved", "pending", "rejected", "closed"],
            default: "pending"
        }
    }
);

const ReIssued = mongoose.model('ReIssued', reIssuedSchema);

module.exports = ReIssued;