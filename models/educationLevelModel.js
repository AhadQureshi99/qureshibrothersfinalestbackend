const mongoose = require("mongoose");

const educationLevelSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, unique: true },
    isActive: { type: Boolean, default: true },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  },
  { timestamps: true }
);

module.exports =
  mongoose.models.EducationLevel ||
  mongoose.model("EducationLevel", educationLevelSchema);
