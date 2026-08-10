const SubCategory = require("../models/subCategoryModel");
const JobCategory = require("../models/jobCategoryModel");

// Create sub category
const { createLog } = require("./activityLogController");
const createSubCategory = async (req, res) => {
  try {
    const { mainCategory, name, description } = req.body;

    // Check if main category exists and is active
    const mainCat = await JobCategory.findById(mainCategory);
    if (!mainCat || !mainCat.isActive) {
      return res
        .status(400)
        .json({ message: "Invalid or inactive main category" });
    }

    const subCategory = await SubCategory.create({
      mainCategory,
      name,
      description,
    });
    // Log activity
    await createLog({
      action: "created",
      entityType: "SubCategory",
      entityId: subCategory._id,
      entityName: subCategory.name || subCategory._id,
      description: `New sub category ${
        subCategory.name || subCategory._id
      } has been created by ${req.user?.username || "System"}`,
      performedBy: req.user?.username || "System",
      performedById: req.user?._id,
      meta: {},
    });
    return res
      .status(201)
      .json({ message: "Sub category created", subCategory });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Server error" });
  }
};

// List sub categories
const listSubCategories = async (req, res) => {
  try {
    const subCategories = await SubCategory.find()
      .sort({ createdAt: -1 })
      .populate("mainCategory", "name");
    return res.json({ subCategories });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Server error" });
  }
};

// Update sub category
const updateSubCategory = async (req, res) => {
  try {
    const { mainCategory, name, description } = req.body;

    // Check if main category exists and is active
    if (mainCategory) {
      const mainCat = await JobCategory.findById(mainCategory);
      if (!mainCat || !mainCat.isActive) {
        return res
          .status(400)
          .json({ message: "Invalid or inactive main category" });
      }
    }

    const updated = await SubCategory.findByIdAndUpdate(
      req.params.subCategoryId,
      { mainCategory, name, description },
      { new: true }
    ).populate("mainCategory", "name");

    if (!updated) {
      return res.status(404).json({ message: "Sub category not found" });
    }

    // Log activity
    await createLog({
      action: "updated",
      entityType: "SubCategory",
      entityId: updated._id,
      entityName: updated.name || updated._id,
      description: `Sub category ${
        updated.name || updated._id
      } has been updated by ${req.user?.username || "System"}`,
      performedBy: req.user?.username || "System",
      performedById: req.user?._id,
      meta: {},
    });
    return res.json({ message: "Sub category updated", subCategory: updated });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Server error" });
  }
};

// Delete sub category
const deleteSubCategory = async (req, res) => {
  try {
    const deleted = await SubCategory.findByIdAndDelete(
      req.params.subCategoryId
    );
    if (!deleted) {
      return res.status(404).json({ message: "Sub category not found" });
    }
    // Log activity
    await createLog({
      action: "deleted",
      entityType: "SubCategory",
      entityId: deleted?._id,
      entityName: deleted?.name || deleted?._id,
      description: `The Sub category ${
        deleted?.name || deleted?._id
      } has been deleted by ${req.user?.username || "System"}`,
      performedBy: req.user?.username || "System",
      performedById: req.user?._id,
      meta: {},
    });
    return res.json({ message: "Sub category deleted" });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Server error" });
  }
};

// Toggle status
const toggleSubCategoryStatus = async (req, res) => {
  try {
    const subCategory = await SubCategory.findById(req.params.subCategoryId);
    if (!subCategory) {
      return res.status(404).json({ message: "Sub category not found" });
    }

    subCategory.isActive = !subCategory.isActive;
    await subCategory.save();

    return res.json({
      message: `Sub category ${
        subCategory.isActive ? "activated" : "deactivated"
      }`,
      subCategory,
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Server error" });
  }
};

module.exports = {
  createSubCategory,
  listSubCategories,
  updateSubCategory,
  deleteSubCategory,
  toggleSubCategoryStatus,
};
