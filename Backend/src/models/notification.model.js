import mongoose from "mongoose";

const notificationSchema = new mongoose.Schema(
  {
    recipient: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true
    },

    type: {
      type: String,
      enum: ["incident", "assignment", "timeline", "status"],
      required: true
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
      default: false,
      index: true
    }
  },
  { timestamps: true }
);

export default mongoose.model("Notification", notificationSchema);