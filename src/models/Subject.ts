import mongoose, { models, Schema } from "mongoose";

const SubjectSchema = new Schema(
  {
    subject_name: { type: String, required: true, trim: true },
    description: { type: String, default: "" },
  },
  { timestamps: true }
);

export const Subject = models.Subject || mongoose.model("Subject", SubjectSchema);