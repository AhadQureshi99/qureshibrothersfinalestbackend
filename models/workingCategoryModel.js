const mongoose = require("mongoose");

const workingCategorySchema = new mongoose.Schema(
  {
    mainCategory: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "JobCategory",
      required: true,
    },
    subCategory: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "SubCategory",
      required: true,
    },
    name: { type: String, required: true },
    description: { type: String },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

module.exports =
  mongoose.models.WorkingCategory ||
  mongoose.model("WorkingCategory", workingCategorySchema);
