import mongoose from "mongoose";
const { Schema } = mongoose;

const voteSchema = new Schema({
  user: {
    type: Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  targetId: {
    type: Schema.Types.ObjectId,
    required: true,
  },
  targetType: {
    type: String,
    enum: ["Question", "Answer"],
    required: true,
  },
  value: {
    type: Number,
    enum: [1, -1],
    required: true,
  }
}, { timestamps: true });

// Compound unique index to ensure a user can only have one active vote per target
voteSchema.index({ user: 1, targetId: 1, targetType: 1 }, { unique: true });

export default mongoose.models.Vote || mongoose.model("Vote", voteSchema);
