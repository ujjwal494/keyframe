import mongoose from "mongoose";
const { Schema } = mongoose;

const questionSchema = new Schema({
  title: {
    type: String,
    required: true,
    trim: true,
    minlength: 10,
    maxlength: 300,
  },
  body: {
    type: String,
    required: true,
    minlength: 20,
  },
  tags: {
    type: [String],
    validate: {
      validator: (v) => v.length >= 1 && v.length <= 5,
      message: "Questions must have between 1 and 5 tags.",
    },
  },
  author: {
    type: Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  upvotes: [{ type: Schema.Types.ObjectId, ref: "User" }],
  downvotes: [{ type: Schema.Types.ObjectId, ref: "User" }],
  voteScore: { type: Number, default: 0 },
  views: { type: Number, default: 0 },
  answerCount: { type: Number, default: 0 },
  acceptedAnswer: { type: Schema.Types.ObjectId, ref: "Answer", default: null },
  status: {
    type: String,
    enum: ["open", "closed", "duplicate"],
    default: "open",
  },
  media: [
    {
      url: { type: String, required: true },
      type: { type: String, enum: ["image", "video"], required: true },
      alt: { type: String, default: "" },
    },
  ],
  slug: { type: String, unique: true },
}, { timestamps: true });

// Generate a URL-friendly slug from the title before saving
questionSchema.pre("validate", function () {
  if (this.isModified("title") || this.isNew) {
    const base = this.title
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, "")   // strip special chars
      .replace(/\s+/g, "-")            // spaces → hyphens
      .replace(/-+/g, "-")             // collapse multiple hyphens
      .substring(0, 80);               // cap length
    // Append a short random suffix for uniqueness
    const suffix = this._id
      ? this._id.toString().slice(-6)
      : Math.random().toString(36).substring(2, 8);
    this.slug = `${base}-${suffix}`;
  }
});

// Indexes for common query patterns
questionSchema.index({ createdAt: -1 }); // For sorting by newest
questionSchema.index({ tags: 1 });       // For filtering by tag
questionSchema.index({ author: 1 });     // For fetching user's questions

export default mongoose.models.Question || mongoose.model("Question", questionSchema);
