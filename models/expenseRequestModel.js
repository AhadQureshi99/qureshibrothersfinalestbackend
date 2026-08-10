const mongoose = require("mongoose");

const expenseRequestSchema = new mongoose.Schema(
  {
    expenseId: { type: mongoose.Schema.Types.ObjectId, ref: "Expense" },
    requestType: { type: String, enum: ["edit", "delete"], required: true },
    requestedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    payload: { type: Object }, // for edit requests
    status: {
      type: String,
      enum: ["pending", "approved", "rejected"],
      default: "pending",
    },
  },
  { timestamps: true }
);

module.exports =
  mongoose.models.ExpenseRequest ||
  mongoose.model("ExpenseRequest", expenseRequestSchema);
