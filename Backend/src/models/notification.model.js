import mongoose from "mongoose";

const notificationSchema = new mongoose.Schema({
  recipient: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  },

  type: {
    type: String,
    enum: [
      "incidentAssigned",
      "newUpdate",
      "statusChange",
      "accountCreated"
    ]
  },

  incident: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Incident"
  },

  message: {
    type: String,
    required: true
  },

  isRead: {
    type: Boolean,
    default: false
  }

}, { timestamps: true });

export default mongoose.model("Notification", notificationSchema);