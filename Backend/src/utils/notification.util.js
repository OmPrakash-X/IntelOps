import Notification from "../models/notification.model.js";
import { getIO } from "../socket/index.js";

export const createNotification = async ({ recipients, message, incidentId, type }) => {
  try {
    const docs = recipients.map((userId) => ({
      recipient: userId,
      message,
      incident: incidentId,
      type
    }));

    // Capture the result so we can emit to each recipient
    const notifications = await Notification.insertMany(docs);

    const io = getIO();
    notifications.forEach((notif) => {
      io.to(notif.recipient.toString()).emit("notification", notif);
    });

  } catch (err) {
    console.error("Notification error:", err.message);
  }
};