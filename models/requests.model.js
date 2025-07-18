const mongoose = require("mongoose");
const moment = require("moment-timezone");

const requestedSchema = new mongoose.Schema(
    {
        productId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Products",
            required: true
        },

        quantity: {
            type: Number,
            required: true
        }
    }
);

const returnSchema = new mongoose.Schema(
    {
        returnedQuantity: {
            type: Number,
            default: 0
        },

        returnDate: {
            type: Date,
            default: () => moment.tz("Asia/Kolkata").toDate()
        },

        damagedQuantity: {
            type: Number,
            default: 0
        },

        userDamagedQuantity: {
            type: Number,
            default: 0
        },
        
        replacedQuantity: {
            type: Number,
            default: 0
        },

        description: {
            type: String,
            default: null
        }
    }
);

const issuedSchema = new mongoose.Schema(
    {
        issuedProductId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Products",
            required: true
        },

        issuedQuantity: {
            type: Number,
            required: true
        },

        return: [returnSchema]
    }
);

const requestSchema = new mongoose.Schema(
    {
        requestId: {
            type: String,
            required: true,
            unique: true
        },

        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Users",
            required: true
        },

        referenceId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "References"
        },

        description: {
            type: String,
            required: true
        },

        requestDate: {
            type: Date,
            default: () => moment.tz("Asia/Kolkata").toDate(),
        },

        requestedDays: {
            type: Number,
            required: true
        },

        adminApprovedDays: {
            type: Number,
            default: null
        },

        requestedProducts: [requestedSchema],

        issued: [issuedSchema],

        issuedDate: {
            type: Date,
            default: null
        },

        reIssued: {
            type: [String],
            default: []
        },

        adminReturnMessage: {
            type: String,
            default: null
        },

        scheduledCollectionDate: {
            type: String,
            default: null
        },

        collectedDate: {
            type: Date,
            default: null
        },

        isDamaged: {
            type: Boolean,
            default: false
        },

        AllReturnedDate: {
            type: Date,
            default: null
        },

        requestStatus: {
            type: String,
            enum: ["approved", "pending", "rejected", "returned", "closed", "reIssued"],
            default: "pending"
        }
    }
);

const Requests = mongoose.model("Requests", requestSchema);

module.exports = Requests;
