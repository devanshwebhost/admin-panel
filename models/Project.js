import mongoose from "mongoose";

const projectSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },

    description: {
      type: String,
      default: "",
    },

    status: {
      type: String,
      enum: ["upcoming", "running", "completed"],
      default: "upcoming",
    },

    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User", // Assuming you have a User model
      required: true,
    },

    assignedTeam: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Team", // Assuming you have a Team model
    },

    tasks: [
      {
        title: String,
        isCompleted: { type: Boolean, default: false },
        assignedTo: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "User",
        },
        completedBy: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "User",
        },
        completedAt: Date,
      },
    ],

    startDate: Date,
    endDate: Date,
  },
  {
    timestamps: true,
  }
);

export default mongoose.models.Project || mongoose.model("Project", projectSchema);
