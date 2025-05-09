const mongoose = require("mongoose");
const moment = require("moment-timezone");

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },

    email: {
      type: String,
      required: true,
      unique: true,
      match: /^\S+@\S+\.\S+$/,
    },

    rollNo: {
      type: String,
      required: true,
      unique: true,
    },

    phoneNo: {
      type: String,
      required: true,
    },

    password: {
      type: String,
      required: true,
    },

    isFaculty: {
      type: Boolean,
      default: false, 
    },

    isAdmin: {
      type: Boolean,
      default: false, 
    },

    isActive: {
      type: Boolean,
      default: true, 
    },

    createdAt: {
      type: Date,
      default: () => moment.tz("Asia/Kolkata").toDate(),
    },
  }
);

const Users = mongoose.model("Users", userSchema);

module.exports = Users;
