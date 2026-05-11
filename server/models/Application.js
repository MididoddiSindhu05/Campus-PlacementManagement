import mongoose from "mongoose";

const applicationSchema = new mongoose.Schema(
  {
    student: { type: mongoose.Schema.Types.ObjectId, ref: "Student", required: true },
    placementDrive: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "PlacementDrive",
      required: true,
    },
    status: {
      type: String,
      enum: ["pending", "shortlisted", "rejected", "offered", "withdrawn"],
      default: "pending",
    },
    remarks: { type: String, default: "" },
    fraudFlag: { type: Boolean, default: false },
    appliedAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

applicationSchema.index({ student: 1, placementDrive: 1 }, { unique: true });

export const Application = mongoose.model("Application", applicationSchema);
