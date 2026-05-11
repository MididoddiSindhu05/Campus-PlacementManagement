import mongoose from "mongoose";

const interviewSchema = new mongoose.Schema(
  {
    application: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Application",
      required: true,
    },
    roundName: { type: String, required: true },
    roundOrder: { type: Number, default: 1 },
    scheduledAt: { type: Date, required: true },
    venue: { type: String, default: "" },
    meetingLink: { type: String, default: "" },
    instructions: { type: String, default: "" },
    admitCardToken: { type: String, default: "" },
    status: {
      type: String,
      enum: ["scheduled", "completed", "cancelled", "no_show"],
      default: "scheduled",
    },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  },
  { timestamps: true }
);

interviewSchema.index({ application: 1, roundOrder: 1 });

export const Interview = mongoose.model("Interview", interviewSchema);
