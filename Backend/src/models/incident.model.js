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

  group: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Group",
    required: true,
    index: true
  },

  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  },

  assignedLead: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
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
    resolution: String,
    // AI-generated additions
    lessonsLearned: [String],
    preventionSteps: [String],
    aiTimeline: [
      {
        time: String,
        event: String
      }
    ],
    generatedAt: Date
  },

  aiSuggestions: {
    // Stored as JSON strings — parsed on the frontend
    // rootCause: matches rootCauseSchema from ai/schemas.js
    rootCause: String,
    // nextAction: matches nextActionSchema from ai/schemas.js
    nextAction: String,
    // Legacy field kept for backward compatibility
    timelineSummary: String,
    // Who manually triggered the AI (if manually run)
    generatedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User"
    },
    // Timestamp of the last successful AI analysis run
    generatedAt: Date
  }

}, { timestamps: true });

export default mongoose.model("Incident", incidentSchema);