const mongoose = require("mongoose");

const jobPaymentSchema = new mongoose.Schema({
  employer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Employer",
    required: true,
  },
  job: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Job",
    required: true,
  },
  unSkilled: {
    type: Number,
    default: 0,
  },
  semiSkilled: {
    type: Number,
    default: 0,
  },
  skilled: {
    type: Number,
    default: 0,
  },
  highlySkilled: {
    type: Number,
    default: 0,
  },
  highlyQualified: {
    type: Number,
    default: 0,
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

module.exports = mongoose.model("JobPayment", jobPaymentSchema);
