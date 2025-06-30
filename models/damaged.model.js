const mongoose = require("mongoose");

const damagedSchema = new mongoose.Schema(
    {
        requestId: {
            type: String,
            ref: "Requests",
            required: true
        },

        productId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Products',
            required: true
        },

        damagedQuantity: {
            type: Number,
            required: true,
            min: 1
        }
    }
);

const Damaged = mongoose.model('Damaged', damagedSchema);

module.exports = Damaged;