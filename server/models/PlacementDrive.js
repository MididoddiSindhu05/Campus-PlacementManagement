import mongoose from "mongoose";

const roundSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    order: { type: Number, default: 1 },
    description: { type: String, default: "" },
  },
  { _id: false }
);

const placementDriveSchema = new mongoose.Schema(
  {
    company: { type: mongoose.Schema.Types.ObjectId, ref: "Company", required: true },
    title: { type: String, required: true, trim: true },
    jobRole: { type: String, required: true, trim: true },
    description: { type: String, default: "" },
    salaryMin: { type: Number, default: 0 },
    salaryMax: { type: Number, default: 0 },
    currency: { type: String, default: "INR" },
    minCgpa: { type: Number, default: 0, min: 0, max: 10 },
    maxBacklogs: { type: Number, default: 99, min: 0 },
    requiredSkills: [{ type: String, trim: true }],
    eligibleDepartments: [{ type: String, trim: true }],
    graduationYears: [{ type: Number }],
    openings: { type: Number, default: 1, min: 1 },
    rounds: [roundSchema],
    applicationDeadline: { type: Date, required: true },
    driveDate: { type: Date },
    status: {
      type: String,
      enum: ["draft", "open", "closed", "completed"],
      default: "open",
    },
    postedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  },
  { timestamps: true }
);

placementDriveSchema.index({ company: 1, status: 1 });
placementDriveSchema.index({ title: "text", jobRole: "text" });

export const PlacementDrive = mongoose.model("PlacementDrive", placementDriveSchema);
