import { Schema, model, models } from "mongoose";

const voteSchema = new Schema(
  {
    mosqueId: { type: Schema.Types.ObjectId, ref: "Mosque", required: true, index: true },
    voteType: { type: String, enum: ["YES", "NO"], required: true },
    voterKeyHash: { type: String, required: true, index: true },
  },
  { timestamps: { createdAt: true, updatedAt: false } },
);

voteSchema.index({ mosqueId: 1, voterKeyHash: 1, createdAt: -1 });
voteSchema.index({ voterKeyHash: 1, createdAt: -1 });

export const Vote = models.Vote || model("Vote", voteSchema);
