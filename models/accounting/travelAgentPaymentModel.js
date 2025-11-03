const mongoose = require("mongoose");

const travelAgentPaymentSchema = new mongoose.Schema({
  vouNumber: {
    type: String,
    required: true,
    unique: true,
  },
  date: {
    type: Date,
    required: true,
  },
  accountCode: {
    type: String,
    required: true,
  },
  payments: [
    {
      name: {
        type: String,
        required: true,
      },
      job: {
        type: String,
        required: true,
      },
      agent: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "TravelAgent",
        required: true,
      },
      description: {
        type: String,
        required: true,
      },
      amount: {
        type: Number,
        required: true,
        min: 0,
      },
    },
  ],
  total: {
    type: Number,
    default: 0,
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

// Calculate total before saving
travelAgentPaymentSchema.pre("save", function (next) {
  this.total = this.payments.reduce((sum, payment) => sum + payment.amount, 0);
  next();
});

module.exports = mongoose.model("TravelAgentPayment", travelAgentPaymentSchema);
