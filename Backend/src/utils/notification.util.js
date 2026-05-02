import Notification from "../models/notification.model.js";

export const createNotification = async ({ recipients, message, incidentId, type }) => {
  try {
    const docs = recipients.map((userId) => ({
      recipient: userId,
      message,
      incident: incidentId,
      type
    }));

    await Notification.insertMany(docs);
    
    const io = getIO();

    notifications.forEach((notif) => {
      io.to(notif.recipient.toString()).emit("notification", notif);
    });
    } catch (err) {
    console.error("Notification error:", err.message);
    }
};