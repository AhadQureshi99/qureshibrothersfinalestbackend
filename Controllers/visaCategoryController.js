const VisaCategory = require("../models/visaCategoryModel");

// Create visa category
const createVisaCategory = async (req, res) => {
  try {
    const { name, description } = req.body;

    const visaCategory = await VisaCategory.create({
      name,
      description,
      createdBy: req.user._id,
    });

    return res.status(201).json({
      message: "Visa Category created successfully",
      visaCategory,
    });
  } catch (err) {
    console.error(err);
    if (err.code === 11000) {
      return res
        .status(400)
        .json({ message: "Visa Category name already exists" });
    }
    return res.status(500).json({ message: "Server error" });
  }
};

// List visa categories
const listVisaCategories = async (req, res) => {
  try {
    const visaCategories = await VisaCategory.find()
      .sort({ createdAt: -1 })
      .populate("createdBy", "username email");
    return res.json({ categories: visaCategories });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Server error" });
  }
};

// Update visa category
const updateVisaCategory = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description, isActive } = req.body;

    const updatedCategory = await VisaCategory.findByIdAndUpdate(
      id,
      { name, description, isActive },
      { new: true }
    );

    if (!updatedCategory) {
      return res.status(404).json({ message: "Visa Category not found" });
    }

    return res.json({
      message: "Visa Category updated successfully",
      visaCategory: updatedCategory,
    });
  } catch (err) {
    console.error(err);
    if (err.code === 11000) {
      return res
        .status(400)
        .json({ message: "Visa Category name already exists" });
    }
    return res.status(500).json({ message: "Server error" });
  }
};

// Delete visa category
const deleteVisaCategory = async (req, res) => {
  try {
    const { id } = req.params;
    const category = await VisaCategory.findById(id);

    if (!category) {
      return res.status(404).json({ message: "Visa Category not found" });
    }

    await VisaCategory.findByIdAndDelete(id);
    return res.json({ message: "Visa Category deleted successfully" });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Server error" });
  }
};

// Toggle active status
const toggleVisaCategoryStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const category = await VisaCategory.findById(id);

    if (!category) {
      return res.status(404).json({ message: "Visa Category not found" });
    }

    category.isActive = !category.isActive;
    await category.save();

    return res.json({
      message: `Visa Category ${
        category.isActive ? "activated" : "deactivated"
      } successfully`,
      visaCategory: category,
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Server error" });
  }
};

module.exports = {
  createVisaCategory,
  listVisaCategories,
  updateVisaCategory,
  deleteVisaCategory,
  toggleVisaCategoryStatus,
};
