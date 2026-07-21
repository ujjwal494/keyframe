import mongoose from "mongoose";
const { Schema } = mongoose;

const answerSchema = new Schema({
  body: {
    type: String,
    required: true,
    minlength: 10,
  },
  author: {
    type: Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  question: {
    type: Schema.Types.ObjectId,
    ref: "Question",
    required: true,
  },
  isAccepted: {
    type: Boolean,
    default: false,
  },
  upvotes: [{ type: Schema.Types.ObjectId, ref: "User" }],
  downvotes: [{ type: Schema.Types.ObjectId, ref: "User" }],
  voteScore: {
    type: Number,
    default: 0,
  },
  media: [
    {
      url: { type: String, required: true },
      type: { type: String, enum: ["image", "video"], required: true },
      alt: { type: String, default: "" },
    },
  ],
}, { timestamps: true });

// Compound index: fetch all answers for a question, sorted by newest
answerSchema.index({ question: 1, createdAt: 1 });
// Index for sorting accepted answers first, then by vote score
answerSchema.index({ question: 1, isAccepted: -1, voteScore: -1 });

export default mongoose.models.Answer || mongoose.model("Answer", answerSchema);
