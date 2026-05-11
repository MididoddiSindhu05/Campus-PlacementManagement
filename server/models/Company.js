import mongoose from "mongoose";

const companySchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    industry: { type: String, default: "" },
    description: { type: String, default: "" },
    website: { type: String, default: "" },
    contactEmail: { type: String, default: "" },
    logoUrl: { type: String, default: "" },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

companySchema.index({ name: "text", industry: "text" });

export const Company = mongoose.model("Company", companySchema);
