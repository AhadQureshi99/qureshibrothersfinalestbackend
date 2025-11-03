const JobCategory = require("../models/jobCategoryModel");

// Create job category
const createJobCategory = async (req, res) => {
  try {
    const { name, description } = req.body;

    const jobCategory = await JobCategory.create({
      name,
      description,
      createdBy: req.user._id,
    });

    return res.status(201).json({
      message: "Job Category created successfully",
      jobCategory,
    });
  } catch (err) {
    console.error(err);
    if (err.code === 11000) {
      return res
        .status(400)
        .json({ message: "Job Category name already exists" });
    }
    return res.status(500).json({ message: "Server error" });
  }
};

// List job categories
const listJobCategories = async (req, res) => {
  try {
    const jobCategories = await JobCategory.find()
      .sort({ createdAt: -1 })
      .populate("createdBy", "username email");
    return res.json({ categories: jobCategories });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Server error" });
  }
};

// Update job category
const updateJobCategory = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description, isActive } = req.body;

    const updatedCategory = await JobCategory.findByIdAndUpdate(
      id,
      { name, description, isActive },
      { new: true }
    );

    if (!updatedCategory) {
      return res.status(404).json({ message: "Job Category not found" });
    }

    return res.json({
      message: "Job Category updated successfully",
      jobCategory: updatedCategory,
    });
  } catch (err) {
    console.error(err);
    if (err.code === 11000) {
      return res
        .status(400)
        .json({ message: "Job Category name already exists" });
    }
    return res.status(500).json({ message: "Server error" });
  }
};

// Delete job category
const deleteJobCategory = async (req, res) => {
  try {
    const { id } = req.params;
    const category = await JobCategory.findById(id);

    if (!category) {
      return res.status(404).json({ message: "Job Category not found" });
    }

    await JobCategory.findByIdAndDelete(id);
    return res.json({ message: "Job Category deleted successfully" });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Server error" });
  }
};

// Toggle active status
const toggleJobCategoryStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const category = await JobCategory.findById(id);

    if (!category) {
      return res.status(404).json({ message: "Job Category not found" });
    }

    category.isActive = !category.isActive;
    await category.save();

    return res.json({
      message: `Job Category ${
        category.isActive ? "activated" : "deactivated"
      } successfully`,
      jobCategory: category,
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Server error" });
  }
};

module.exports = {
  createJobCategory,
  listJobCategories,
  updateJobCategory,
  deleteJobCategory,
  toggleJobCategoryStatus,
};
