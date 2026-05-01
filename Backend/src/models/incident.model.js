import mongoose from "mongoose";

const incidentSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },

  description: {
    type: String,
    trim: true
  },

  status: {
    type: String,
    enum: ["open", "inProgress", "resolved"],
    default: "open",
    index: true
  },

  severity: {
    type: String,
    enum: ["low", "medium", "high"],
    default: "low",
    index: true
  },

  isPublic: {
    type: Boolean,
    default: false
  },

  // Generating a unique slug for public page and ignoring this field for non-public incidents using sparse.
  publicSlug: {
    type: String,
    unique: true,
    sparse: true
  },

  project: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Project"
  },

  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  },

  assignedLead: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    index: true
  },

  responders: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User"
    }
  ],

  resolvedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User"
  },

  resolvedAt: Date,

  postmortem: {
    summary: String,
    rootCause: String,
    impact: String,
    resolution: String
  },

  aiSuggestions: {
    nextAction: String,
    timelineSummary: String,
    generatedAt: Date
  }

}, { timestamps: true });

export default mongoose.model("Incident", incidentSchema);