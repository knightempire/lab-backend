import mongoose from "mongoose";

const componentSchema = new mongoose.Schema(
    {
        name: {
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

        isDisplay: {
            type: Boolean,
            default: true,
        }
    }
);

const Components = mongoose.model("Components", componentSchema);

export default Components;