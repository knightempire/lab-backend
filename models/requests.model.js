const mongoose = require("mongoose");

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
            default: null
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
            ref: "Users",
            required: true
        },

        description: {
            type: String,
            required: true
        },

        requestDate: {
            type: Date,
            default: Date.now
        },

        requestedDays: {
            type: Number,
            required: true
        },

        requestedProducts: [requestedSchema],

        issued: [issuedSchema],

        issuedDate: {
            type: Date,
            default: null
        },

        issuedDescription: {
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
