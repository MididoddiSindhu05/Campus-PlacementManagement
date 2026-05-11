import mongoose from "mongoose";

const reportSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    generatedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    type: {
      type: String,
      enum: ["placement_summary", "student_export", "department_stats", "custom"],
      default: "placement_summary",
    },
    payload: { type: mongoose.Schema.Types.Mixed, default: {} },
    filePath: { type: String, default: "" },
  },
  { timestamps: true }
);

export const Report = mongoose.model("Report", reportSchema);
