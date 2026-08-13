const mongoose = require("mongoose");

const jobCategoryJobSchema = new mongoose.Schema(
  {
    jobTitle: { type: String, required: true },
    noOfPerson: { type: Number, required: true },
    education: { type: String },
    description: { type: String },
    location: { type: String },
  },
  { _id: true }
);

const jobCategorySchema = new mongoose.Schema(
  {
    name: { type: String },
    companyId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Company",
    },
    travelAgentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "TravelAgent",
    },
    description: { type: String },
    jobs: [jobCategoryJobSchema],
    isActive: { type: Boolean, default: true },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  },
  { timestamps: true }
);

module.exports =
  mongoose.models.JobCategory ||
  mongoose.model("JobCategory", jobCategorySchema);
