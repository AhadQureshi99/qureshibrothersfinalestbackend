const mongoose = require("mongoose");

const ageRangeSchema = new mongoose.Schema(
  {
    ageRange: { type: String, required: true, unique: true },
    isActive: { type: Boolean, default: true },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  },
  { timestamps: true }
);

module.exports =
  mongoose.models.AgeRange || mongoose.model("AgeRange", ageRangeSchema);
