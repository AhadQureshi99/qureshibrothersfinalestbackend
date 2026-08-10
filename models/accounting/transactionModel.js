const mongoose = require("mongoose");

const transactionSchema = new mongoose.Schema(
  {
    transactionType: {
      type: String,
      enum: [
        "Cash Receipt",
        "Cash Payment",
        "Bank Receipt",
        "Bank Payment",
        "JV",
        "Candidate Receipt",
        "Candidate JV",
        "Job Payment",
        "Travel Agent Payment",
        "Expenses Against Candidate",
      ],
      required: true,
    },
    date: { type: Date, required: true },
    reference: { type: String, required: true },
    description: { type: String },
    expenseCategory: { type: String, default: "" },
    payee: { type: String, default: "" },
    paymentMethod: { type: String, enum: ["", "Cash", "Bank"], default: "" },
    amount: { type: Number, required: true },
    account: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Account",
      required: false,
    },
    contraAccount: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Account",
      required: false,
    },
    candidate: { type: mongoose.Schema.Types.ObjectId, ref: "Candidate" },
    paymentAgent: { type: mongoose.Schema.Types.ObjectId, ref: "PaymentAgent" },
    travelAgent: { type: mongoose.Schema.Types.ObjectId, ref: "TravelAgent" },
    job: { type: mongoose.Schema.Types.ObjectId, ref: "Job" },
    employee: { type: mongoose.Schema.Types.ObjectId, ref: "Employee" },
    paymentTo: { type: String, default: "" },
    attachments: [{ type: String }],
    status: {
      type: String,
      enum: ["Pending", "Approved", "Rejected"],
      default: "Approved",
    },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  },
  { timestamps: true }
);

module.exports =
  mongoose.models.Transaction ||
  mongoose.model("Transaction", transactionSchema);
