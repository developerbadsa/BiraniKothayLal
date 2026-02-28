import { Schema, model, models } from "mongoose";

const submissionRateSchema = new Schema(
  {
    voterKeyHash: { type: String, required: true, unique: true },
    lastSubmittedAt: { type: Date, required: true },
  },
  { timestamps: false },
);

export const SubmissionRate = models.SubmissionRate || model("SubmissionRate", submissionRateSchema);
