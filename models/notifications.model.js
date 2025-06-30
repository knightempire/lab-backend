const mongoose = require('mongoose');
const { Schema } = mongoose;
const moment = require("moment-timezone");

const notificationSchema = new mongoose.Schema(
    {
        type: {
    type: String,
    required: true,
    enum: [
      "new_request_added",
      "collection_scheduled",
      "status_closed",
      "low_stock_item",
      "stock_updated",
      "new_products_uploaded",
      "damaged_product",
      "new_product",
    ],
  },
  title: { type: String, required: true },
  message: { type: String, required: true },
  relatedItemId: { type: Schema.Types.ObjectId, ref: "AnyModel", required: false },
  isRead: { type: Boolean, default: false },
  createdAt: { type: Date, default: () => moment.tz("Asia/Kolkata").toDate() },
    }
);

const Notifications = mongoose.model('Notifications', notificationSchema);

module.exports = Notifications;