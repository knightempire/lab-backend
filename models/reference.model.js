const mongoose = require("mongoose");
const moment = require("moment-timezone");

const referenceSchema = new mongoose.Schema(
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

      createdAt: {
      type: Date,
      default: () => moment.tz("Asia/Kolkata").toDate(),
    },
  }
);

const references = mongoose.model("references", referenceSchema);

module.exports = references;
