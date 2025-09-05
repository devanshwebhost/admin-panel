import mongoose from "mongoose";

const TaskSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String },
  
  assignedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  assignedTo: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],

  team: { type: mongoose.Schema.Types.ObjectId, ref: "Team", default: null },
  
  // New fields for team name and ID
  teamName: { type: String, default: null },
  teamId: { type: mongoose.Schema.Types.ObjectId, ref: "Team", default: null },
  
  status: { type: String, enum: ["pending", "in-progress", "completed"], default: "pending" },
  
  dueDate: { type: Date },
}, { timestamps: true });

export default mongoose.models.Task || mongoose.model("Task", TaskSchema);