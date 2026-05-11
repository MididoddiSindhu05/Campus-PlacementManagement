import mongoose from "mongoose";

const notificationSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null },
    audienceRole: {
      type: String,
      enum: ["all", "student", "admin", "placement_officer"],
      default: "all",
    },
    title: { type: String, required: true },
    message: { type: String, required: true },
    type: {
      type: String,
      enum: ["info", "reminder", "success", "alert"],
      default: "info",
    },
    link: { type: String, default: "" },
    readBy: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
  },
  { timestamps: true }
);

export const Notification = mongoose.model("Notification", notificationSchema);
