const WorkingCategory = require("../models/workingCategoryModel");
const JobCategory = require("../models/jobCategoryModel");
const SubCategory = require("../models/subCategoryModel");

// Create working category
const createWorkingCategory = async (req, res) => {
  try {
    const { mainCategory, subCategory, name, description } = req.body;

    // Check if main category exists and is active
    const mainCat = await JobCategory.findById(mainCategory);
    if (!mainCat || !mainCat.isActive) {
      return res
        .status(400)
        .json({ message: "Invalid or inactive main category" });
    }

    // Check if sub category exists and is active
    const subCat = await SubCategory.findById(subCategory);
    if (!subCat || !subCat.isActive) {
      return res
        .status(400)
        .json({ message: "Invalid or inactive sub category" });
    }

    const workingCategory = await WorkingCategory.create({
      mainCategory,
      subCategory,
      name,
      description,
    });
    return res
      .status(201)
      .json({ message: "Working category created", workingCategory });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Server error" });
  }
};

// List working categories
const listWorkingCategories = async (req, res) => {
  try {
    const workingCategories = await WorkingCategory.find()
      .sort({ createdAt: -1 })
      .populate("mainCategory", "name")
      .populate("subCategory", "name");
    return res.json({ workingCategories });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Server error" });
  }
};

// Update working category
const updateWorkingCategory = async (req, res) => {
  try {
    const { mainCategory, subCategory, name, description } = req.body;

    // Check if main category exists and is active
    if (mainCategory) {
      const mainCat = await JobCategory.findById(mainCategory);
      if (!mainCat || !mainCat.isActive) {
        return res
          .status(400)
          .json({ message: "Invalid or inactive main category" });
      }
    }

    // Check if sub category exists and is active
    if (subCategory) {
      const subCat = await SubCategory.findById(subCategory);
      if (!subCat || !subCat.isActive) {
        return res
          .status(400)
          .json({ message: "Invalid or inactive sub category" });
      }
    }

    const updated = await WorkingCategory.findByIdAndUpdate(
      req.params.workingCategoryId,
      { mainCategory, subCategory, name, description },
      { new: true }
    )
      .populate("mainCategory", "name")
      .populate("subCategory", "name");

    if (!updated) {
      return res.status(404).json({ message: "Working category not found" });
    }

    return res.json({
      message: "Working category updated",
      workingCategory: updated,
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Server error" });
  }
};

// Delete working category
const deleteWorkingCategory = async (req, res) => {
  try {
    const deleted = await WorkingCategory.findByIdAndDelete(
      req.params.workingCategoryId
    );
    if (!deleted) {
      return res.status(404).json({ message: "Working category not found" });
    }
    return res.json({ message: "Working category deleted" });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Server error" });
  }
};

// Toggle status
const toggleWorkingCategoryStatus = async (req, res) => {
  try {
    const workingCategory = await WorkingCategory.findById(
      req.params.workingCategoryId
    );
    if (!workingCategory) {
      return res.status(404).json({ message: "Working category not found" });
    }

    workingCategory.isActive = !workingCategory.isActive;
    await workingCategory.save();

    return res.json({
      message: `Working category ${
        workingCategory.isActive ? "activated" : "deactivated"
      }`,
      workingCategory,
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Server error" });
  }
};

module.exports = {
  createWorkingCategory,
  listWorkingCategories,
  updateWorkingCategory,
  deleteWorkingCategory,
  toggleWorkingCategoryStatus,
};
