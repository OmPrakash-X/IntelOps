import mongoose from "mongoose";

const timelineSchema = new mongoose.Schema({
  incident: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Incident",
    required: true,
    index: true // To optimize queries of indentifying the incident.
  },

  type: {
    type: String,
    enum: ["update", "action", "status"],
    default: "update"
  },

  message: {
    type: String,
    required: true
  },

  isPublic: {
    type: Boolean,
    default: false
  },
  // To show only public timeline events on the public page.

  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User"
  }

}, { timestamps: true });

export default mongoose.model("Timeline", timelineSchema);