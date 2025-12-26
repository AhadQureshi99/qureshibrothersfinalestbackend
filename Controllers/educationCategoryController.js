const EducationCategory = require("../models/educationCategoryModel");
const { createLog } = require("./activityLogController");

// Create education category
const createEducationCategory = async (req, res) => {
  try {
    const { name, description } = req.body;

    const educationCategory = await EducationCategory.create({
      name,
      description,
      createdBy: req.user._id,
    });
    // Log activity
    await createLog({
      action: "created",
      entityType: "EducationCategory",
      entityId: educationCategory._id,
      entityName: educationCategory.name || educationCategory._id,
      description: `New education category ${
        educationCategory.name || educationCategory._id
      } has been created by ${req.user?.username || "System"}`,
      performedBy: req.user?.username || "System",
      performedById: req.user?._id,
      meta: {},
    });
    return res.status(201).json({
      message: "Education Category created successfully",
      educationCategory,
    });
  } catch (err) {
    console.error(err);
    if (err.code === 11000) {
      return res
        .status(400)
        .json({ message: "Education Category name already exists" });
    }
    return res.status(500).json({ message: "Server error" });
  }
};

// List education categories
const listEducationCategories = async (req, res) => {
  try {
    const educationCategories = await EducationCategory.find()
      .sort({ createdAt: -1 })
      .populate("createdBy", "username email");
    return res.json({ categories: educationCategories });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Server error" });
  }
};

// Update education category
const updateEducationCategory = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description, isActive } = req.body;

    const updatedCategory = await EducationCategory.findByIdAndUpdate(
      id,
      { name, description, isActive },
      { new: true }
    );

    if (!updatedCategory) {
      return res.status(404).json({ message: "Education Category not found" });
    }

    // Log activity
    await createLog({
      action: "updated",
      entityType: "EducationCategory",
      entityId: updatedCategory._id,
      entityName: updatedCategory.name || updatedCategory._id,
      description: `Education Category ${
        updatedCategory.name || updatedCategory._id
      } has been updated by ${req.user?.username || "System"}`,
      performedBy: req.user?.username || "System",
      performedById: req.user?._id,
      meta: {},
    });
    return res.json({
      message: "Education Category updated successfully",
      educationCategory: updatedCategory,
    });
  } catch (err) {
    console.error(err);
    if (err.code === 11000) {
      return res
        .status(400)
        .json({ message: "Education Category name already exists" });
    }
    return res.status(500).json({ message: "Server error" });
  }
};

// Delete education category
const deleteEducationCategory = async (req, res) => {
  try {
    const { id } = req.params;
    const category = await EducationCategory.findById(id);

    if (!category) {
      return res.status(404).json({ message: "Education Category not found" });
    }

    const deleted = await EducationCategory.findByIdAndDelete(id);
    // Log activity
    await createLog({
      action: "deleted",
      entityType: "EducationCategory",
      entityId: deleted?._id,
      entityName: deleted?.name || deleted?._id,
      description: `The Education Category ${
        deleted?.name || deleted?._id
      } has been deleted by ${req.user?.username || "System"}`,
      performedBy: req.user?.username || "System",
      performedById: req.user?._id,
      meta: {},
    });
    return res.json({ message: "Education Category deleted successfully" });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Server error" });
  }
};

// Toggle active status
const toggleEducationCategoryStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const category = await EducationCategory.findById(id);

    if (!category) {
      return res.status(404).json({ message: "Education Category not found" });
    }

    category.isActive = !category.isActive;
    await category.save();

    return res.json({
      message: `Education Category ${
        category.isActive ? "activated" : "deactivated"
      } successfully`,
      educationCategory: category,
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Server error" });
  }
};

module.exports = {
  createEducationCategory,
  listEducationCategories,
  updateEducationCategory,
  deleteEducationCategory,
  toggleEducationCategoryStatus,
};
