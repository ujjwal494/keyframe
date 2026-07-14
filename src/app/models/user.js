import mongoose from "mongoose";
const { Schema } = mongoose;

const userSchema = new Schema({
  email: { type: String, required: true, unique: true, lowercase: true, trim: true },
  username: { type: String, required: true, unique: true, trim: true },
  displayName: { type: String, required: true, trim: true },
  passwordHash: { type: String, required: true },
  profilePic: { type: String, default: "" },
  bio: { type: String, maxlength: 300 },
  skillTags: [String], // e.g. "Premiere Pro", "After Effects", "DaVinci Resolve"
  reputation: { type: Number, default: 1 },
  badges: [{ name: String, earnedAt: Date }],
}, { timestamps: true });

export default mongoose.models.User || mongoose.model("User", userSchema);