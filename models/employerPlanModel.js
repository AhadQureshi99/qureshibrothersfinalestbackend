const mongoose = require("mongoose");

const employerPlanSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      unique: true,
    },
    amount: {
      type: Number,
      required: true,
      default: 0,
    },
    validForDays: {
      type: Number,
      required: true,
    },
    maxJobsAllowed: {
      type: Number,
      required: true,
      default: -1, // -1 for unlimited
    },
    supportsFeaturedJobs: {
      type: Boolean,
      required: true,
      default: true,
    },
    allowedNumberOfFeaturedJobs: {
      type: Number,
      required: true,
      default: -1, // -1 for unlimited
    },
    featuredJobAmount: {
      type: Number,
      required: true,
      default: 0,
    },
    featuredEmployerAmount: {
      type: Number,
      required: true,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("EmployerPlan", employerPlanSchema);
