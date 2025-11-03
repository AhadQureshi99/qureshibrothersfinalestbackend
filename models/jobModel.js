const mongoose = require("mongoose");

const jobSchema = new mongoose.Schema(
  {
    employer: {
      type: String,
      required: true,
    },
    jobTitle: {
      type: String,
      required: true,
    },
    jobNo: {
      type: String,
      required: true,
    },
    processTypes: {
      type: String,
      required: true,
    },
    receiptDate: {
      type: Date,
    },
    letterNo: {
      type: String,
    },
    visaNo: {
      type: String,
    },
    numberOfVisa: {
      type: Number,
      default: 0,
    },
    visaDate: {
      type: Date,
    },
    currency: {
      type: String,
    },
    permissionNo: {
      type: String,
      required: true,
    },
    permissionDate: {
      type: Date,
      required: true,
    },
    issuanceDate: {
      type: Date,
    },
    deadlineDate: {
      type: Date,
    },
    salaryAmount: {
      type: Number,
      default: 0,
    },
    deploymentArea: {
      type: String,
    },
    city: {
      type: String,
    },
    state: {
      type: String,
    },
    country: {
      type: String,
    },
    categories: {
      type: String,
      required: true,
    },
    jobTitleForDisplay: {
      type: String,
      required: true,
    },
    type: {
      type: String,
      required: true,
    },
    noOfPerson: {
      type: Number,
      required: true,
    },
    educationalCategory: {
      type: String,
    },
    educationLevel: {
      type: String,
    },
    experienceRange: {
      type: String,
    },
    ageRange: {
      type: String,
    },
    salaryRange: {
      type: String,
    },
    careerLevel: {
      type: String,
    },
    salary: {
      type: Number,
      required: true,
    },
    contractDuration: {
      type: Number,
      required: true,
    },
    skills: {
      type: String,
    },
    additionalExperience: {
      type: String,
    },
    jobDetails: {
      type: String,
    },
    specialInstructions: {
      type: String,
    },
    jobDescription: {
      type: String,
    },
    jobType: {
      type: String,
      enum: ["Full Time", "Part Time", "Contract"],
      default: "Full Time",
    },
    applyMode: {
      type: String,
      enum: ["With Resume Online", "Via Email", "Via Post"],
      default: "With Resume Online",
    },
    jobStatus: {
      type: String,
      enum: ["Open", "Closed", "In Progress"],
      default: "Open",
    },
    showOnWeb: {
      type: Boolean,
      default: false,
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Job", jobSchema);
