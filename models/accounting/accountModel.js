const mongoose = require("mongoose");

const accountSchema = new mongoose.Schema(
  {
    accountCode: { type: String, required: true, unique: true },
    accountName: { type: String, required: true },
    accountType: {
      type: String,
      enum: ["Asset", "Liability", "Equity", "Revenue", "Expense"],
      required: true,
    },
    subType: {
      type: String,
      enum: [
        "Current Asset",
        "Fixed Asset",
        "Current Liability",
        "Long-term Liability",
        "Owner's Equity",
        "Retained Earnings",
        "Operating Revenue",
        "Other Revenue",
        "Operating Expense",
        "Other Expense",
      ],
    },
    parentAccount: { type: mongoose.Schema.Types.ObjectId, ref: "Account" },
    isActive: { type: Boolean, default: true },
    description: { type: String },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  },
  { timestamps: true }
);

module.exports =
  mongoose.models.Account || mongoose.model("Account", accountSchema);
