import mongoose from "mongoose";

const studentSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, unique: true },
    rollNumber: { type: String, required: true, trim: true, unique: true },
    phone: { type: String, default: "" },
    department: { type: String, required: true, trim: true },
    cgpa: { type: Number, required: true, min: 0, max: 10 },
    backlogs: { type: Number, default: 0, min: 0 },
    graduationYear: { type: Number, required: true },
    skills: [{ type: String, trim: true }],
    resumeFileName: { type: String, default: "" },
    resumePath: { type: String, default: "" },
    resumeScore: { type: Number, min: 0, max: 100, default: 0 },
    placed: { type: Boolean, default: false },
    placedCompanyName: { type: String, default: "" },
    placementDriveId: { type: mongoose.Schema.Types.ObjectId, ref: "PlacementDrive", default: null },
    rankScore: { type: Number, default: 0 },
  },
  { timestamps: true }
);

studentSchema.index({ department: 1, graduationYear: 1 });
studentSchema.index({ rollNumber: "text", department: "text" });

export const Student = mongoose.model("Student", studentSchema);
