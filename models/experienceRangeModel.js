const mongoose = require("mongoose");

const experienceRangeSchema = new mongoose.Schema(
  {
    experienceRange: { type: String, required: true, unique: true },
    isActive: { type: Boolean, default: true },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  },
  { timestamps: true }
);

module.exports =
  mongoose.models.ExperienceRange ||
  mongoose.model("ExperienceRange", experienceRangeSchema);
