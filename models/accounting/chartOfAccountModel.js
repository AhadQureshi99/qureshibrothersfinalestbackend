const mongoose = require("mongoose");

const chartOfAccountSchema = new mongoose.Schema(
  {
    code: { type: String, default: "" },
    name: { type: String, required: true },
    type: {
      type: String,
      enum: ["Main", "Control", "Sub", "Account"],
      required: true,
    },
    parent: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "ChartOfAccount",
      default: null,
    },
    isActive: { type: Boolean, default: true },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  },
  { timestamps: true },
);

module.exports =
  mongoose.models.ChartOfAccount ||
  mongoose.model("ChartOfAccount", chartOfAccountSchema);
