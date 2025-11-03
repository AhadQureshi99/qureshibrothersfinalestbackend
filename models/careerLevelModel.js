const mongoose = require("mongoose");

const careerLevelSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, unique: true },
    isActive: { type: Boolean, default: true },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  },
  { timestamps: true }
);

module.exports =
  mongoose.models.CareerLevel ||
  mongoose.model("CareerLevel", careerLevelSchema);
