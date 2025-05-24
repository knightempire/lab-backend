const mongoose = require("mongoose");

const productSchema = new mongoose.Schema(
    {
        product_name: {
            type: String,
            required: true
        },

        quantity: {
            type: Number,
            required: true,
            min: 1
        },

        damagedQuantity: {
            type: Number,
            default: 0
        },

        inStock: {
            type: Number,
            required: true
        },

        yetToGive: {
            type: Number,
            default: 0
        },

        isDisplay: {
            type: Boolean,
            default: true,
        }
    }
);

const Products = mongoose.model("Products", productSchema);

module.exports = Products;