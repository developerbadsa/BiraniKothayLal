import { Schema, model, models, type Model } from "mongoose";

export interface SubmissionRateDoc {
  voterKeyHash: string;
  lastSubmittedAt: Date;
}

const submissionRateSchema = new Schema<SubmissionRateDoc>(
  {
    voterKeyHash: { type: String, required: true, unique: true },
    lastSubmittedAt: { type: Date, required: true },
  },
  { timestamps: false },
);

export const SubmissionRate =
  (models.SubmissionRate as Model<SubmissionRateDoc>) || model<SubmissionRateDoc>("SubmissionRate", submissionRateSchema);
