const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: true
        },

        email: {
            type: String,
            required: true,
            unique: true,
            match: /^\S+@\S+\.\S+$/
        },

        rollNo: {
            type: String,
            required: true,
            unique: true
        },

        phoneNo: {
            type: String,
            required: true,
            match: /^[0-9]{10}$/
        },

        password: {
            type: String,
            required: true,
            minlength: 8
        },

        isFaculty: {
            type: Boolean,
            required: true
        },

        isAdmin: {
            type: Boolean,
            required: true
        },

        isActive: {  
            type: Boolean,
            default: true 
        }
    },
    {
        timestamps: true
    }
);

const Users = mongoose.model("Users", userSchema);

module.exports = Users;
