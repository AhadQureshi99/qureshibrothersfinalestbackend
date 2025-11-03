const mongoose = require("mongoose");

const salaryRangeSchema = new mongoose.Schema(
  {
    salaryRange: { type: String, required: true, unique: true },
    isActive: { type: Boolean, default: true },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  },
  { timestamps: true }
);

module.exports =
  mongoose.models.SalaryRange ||
  mongoose.model("SalaryRange", salaryRangeSchema);
