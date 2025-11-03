const mongoose = require("mongoose");

const expenseSchema = new mongoose.Schema(
  {
    date: { type: Date, required: true },
    type: {
      type: String,
      enum: ["office", "bills", "salaries", "other"],
      default: "other",
    },
    expenseName: { type: String, required: true },
    amount: { type: Number, required: true },
    remarks: { type: String },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  },
  { timestamps: true }
);

module.exports =
  mongoose.models.Expense || mongoose.model("Expense", expenseSchema);
