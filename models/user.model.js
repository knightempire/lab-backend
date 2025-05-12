const mongoose = require("mongoose");
const moment = require("moment-timezone");
const References = require("./reference.model");

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

userSchema.pre("save", async function (next) {
  try {
    if (this.isFaculty) {
      const updateResult = await References.updateOne(
        { email: this.email },
        { $setOnInsert: { name: this.name, email: this.email } },
        { upsert: true }
      );

      if (updateResult.upserted) {
        console.log(`Reference created for ${this.email}`);
      } else {
        console.log(`Reference already exists for ${this.email}`);
      }
    }
    next();
  } catch (err) {
    console.error("Error in user pre-save hook:", err);
    next(err);
  }
});

const Users = mongoose.model("Users", userSchema);

module.exports = Users;
