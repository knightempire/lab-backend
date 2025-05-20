const mongoose = require("mongoose");
const moment = require("moment-timezone");

const requestedSchema = new mongoose.Schema(
    {
        productName: {
            type: String,
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
        }
    }
);

const issuedSchema = new mongoose.Schema(
    {
        issuedProduct: {
            type: String,
            default: ""
        },

        issuedQuantity: {
            type: Number,
            default: 0
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
            ref: "References",
            required: true
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

        isDamaged: {
            type: Boolean,
            default: false
        },

        isAllReturned: {
            type: Boolean,
            default: false
        },

        returnedDate: {
            type: Date,
            default: null
        },

        requestStatus: {
            type: String,
            enum: ["approved", "pending", "rejected"],
            default: "pending"
        }
    }
);

const Requests = mongoose.model("Requests", requestSchema);

module.exports = Requests;
