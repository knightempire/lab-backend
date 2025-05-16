const mongoose = require("mongoose");
const moment = require("moment-timezone");

const reIssuedSchema = new mongoose.Schema(
    {
        requestId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Requests",
            required: true
        },

        requestedDays: {
            type: Number,
            required: true
        },

        approvedDate: {
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
            enum: ["approved", "pending", "rejected"],
            default: "pending"
        }
    }
);

const ReIssued = mongoose.model('ReIssued', reIssuedSchema);

module.exports = ReIssued;