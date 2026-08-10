const mongoose = require("mongoose");

const visaProfessionSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, unique: true },
    description: { type: String },
    isActive: { type: Boolean, default: true },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  },
  { timestamps: true }
);

module.exports =
  mongoose.models.VisaProfession ||
  mongoose.model("VisaProfession", visaProfessionSchema);
