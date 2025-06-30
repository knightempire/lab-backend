const Notifications = require("../models/notifications.model");
const moment = require("moment-timezone");

const createNotification = async (req, res) => {
  try {
    const { type, title, message, relatedItemId } = req.body;

    const notification = new Notifications({
      type,
      title,
      message,
      relatedItemId,
      createdAt: moment.tz("Asia/Kolkata").toDate(),
    });

    await notification.save();
    res.status(201).json({ status: 201, data: notification });
  } catch (err) {
    console.log('Error in createNotification: ', err);
    res.status(500).json({ message: "Server error" });
  }
};

const getAllNotifications = async (req, res) => {
  try {
    const notifications = (await Notifications.find().sort({ createdAt: -1 })).filter(notification => {
        return notification.isRead === false;
    });
    res.status(200).json({ status: 200, data: notifications });
  } catch (err) {
    console.log('Error in getAllNotifications: ', err);
    res.status(500).json({ message: "Server error" });
  }
};

const markNotificationAsRead = async (req, res) => {
  try {
    const { id } = req.params;

    const notification = await Notifications.findByIdAndUpdate(
      id,
      { isRead: true },
      { new: true }
    );

    if (!notification) {
      return res.status(404).json({ success: false, message: "Notification not found" });
    }

    res.status(200).json({ status: 200, data: notification });
  } catch (err) {
    console.log('Error in markNotificationAsRead: ', err);
    res.status(500).json({ message: "Server error" });
  }
};

const markAllNotificationsAsRead = async (req, res) => {
  try {
    await Notifications.updateMany({ isRead: false }, { isRead: true });
    res.status(200).json({ status: 200, message: "All notifications marked as read" });
  } catch (err) {
    console.log('Error in markAllNotificationAsRead: ', err);
    res.status(500).json({ message: "Server error" });
  }
};

module.exports = {
  createNotification,
  getAllNotifications,
  markNotificationAsRead,
  markAllNotificationsAsRead,
};