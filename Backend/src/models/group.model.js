import mongoose from "mongoose";

const groupSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },

  dept: {
    type: String,
    trim: true
  },

  project: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Project"
  },

  teamLead: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User"
  },

  teamMembers: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User"
    }
  ],

  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User"
  }

}, { timestamps: true });

export default mongoose.model("Group", groupSchema);