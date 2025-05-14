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
            type: [Date],
            default: []
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
            type: [Date],
            default: () => [moment.tz("Asia/Kolkata").toDate()],
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
            type: [Date],
            default: []
        },

        adminReturnMessage: {
            type: String,
            default: null
        },

        isAllReturned: {
            type: Boolean,
            default: false
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
