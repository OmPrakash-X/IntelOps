import Notification from "../models/notification.model.js";

export const getNotifications = async (req, res) => {
  try {
    const notifications = await Notification.find({
      recipient: req.user._id
    })
      .sort({ createdAt: -1 })
      .limit(50);

    res.status(200).json({
      success: true,
      data: notifications
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message
    });
  }
};


export const markAsRead = async (req, res) => {
  try {
    const { id } = req.params;

    const notification = await Notification.findByIdAndUpdate(
      id,
      { isRead: true },
      { new: true }
    );

    res.status(200).json({
      success: true,
      data: notification
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message
    });
  }
};