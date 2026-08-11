const JobCategory = require("../models/jobCategoryModel");
const Company = require("../models/companyModel");
const { createLog } = require("./activityLogController");

// Create job category
const createJobCategory = async (req, res) => {
  try {
    const { name, description, companyId, jobs } = req.body;

    if (!companyId) {
      return res.status(400).json({ message: "Please select a company" });
    }
    if (!Array.isArray(jobs) || jobs.length === 0) {
      return res.status(400).json({ message: "Please add at least one job" });
    }

    const normalizedJobs = jobs.map((job) => ({
      jobTitle: String(job.jobTitle || "").trim(),
      noOfPerson: Number(job.noOfPerson),
      education: String(job.education || "").trim(),
      description: String(job.description || "").trim(),
      location: String(job.location || "").trim(),
    }));
    const invalidJob = normalizedJobs.find(
      (job) => !job.jobTitle || !Number.isFinite(job.noOfPerson) || job.noOfPerson < 1,
    );
    if (invalidJob) {
      return res.status(400).json({ message: "Every job needs a title and at least one person" });
    }

    // Verify company exists
    const company = await Company.findById(companyId);
    if (!company) {
      return res.status(400).json({ message: "Company not found" });
    }

    const jobCategory = await JobCategory.create({
      // The current screen has no separate category-name field. Use the first
      // job title as a meaningful fallback so old and new records save safely.
      name: String(name || normalizedJobs[0].jobTitle).trim(),
      description,
      companyId,
      jobs: normalizedJobs,
      createdBy: req.user._id,
    });
    // Log activity
    await createLog({
      action: "created",
      entityType: "JobCategory",
      entityId: jobCategory._id,
      entityName: jobCategory.name || jobCategory._id,
      description: `New job category ${
        jobCategory.name || jobCategory._id
      } has been created by ${req.user?.username || "System"}`,
      performedBy: req.user?.username || "System",
      performedById: req.user?._id,
      meta: {},
    });
    return res.status(201).json({
      message: "Job Category created successfully",
      jobCategory,
    });
  } catch (err) {
    console.error("createJobCategory error:", err);
    return res.status(500).json({ message: err.message || "Unable to save job category" });
  }
};

// List job categories
const listJobCategories = async (req, res) => {
  try {
    const jobCategories = await JobCategory.find()
      .sort({ createdAt: -1 })
      .populate("createdBy", "username email")
      .populate("companyId", "name email phone address logo");
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
    const { name, description, companyId, jobs, isActive } = req.body;

    const updateData = {
      name,
      description,
      companyId,
      jobs,
      isActive,
    };

    const updatedCategory = await JobCategory.findByIdAndUpdate(
      id,
      updateData,
      { new: true }
    );

    if (!updatedCategory) {
      return res.status(404).json({ message: "Job Category not found" });
    }

    // Log activity
    await createLog({
      action: "updated",
      entityType: "JobCategory",
      entityId: updatedCategory._id,
      entityName: updatedCategory.name || updatedCategory._id,
      description: `Job Category ${
        updatedCategory.name || updatedCategory._id
      } has been updated by ${req.user?.username || "System"}`,
      performedBy: req.user?.username || "System",
      performedById: req.user?._id,
      meta: {},
    });
    return res.json({
      message: "Job Category updated successfully",
      jobCategory: updatedCategory,
    });
  } catch (err) {
    console.error(err);
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

    const deleted = await JobCategory.findByIdAndDelete(id);
    // Log activity
    await createLog({
      action: "deleted",
      entityType: "JobCategory",
      entityId: deleted?._id,
      entityName: deleted?.name || deleted?._id,
      description: `The Job Category ${
        deleted?.name || deleted?._id
      } has been deleted by ${req.user?.username || "System"}`,
      performedBy: req.user?.username || "System",
      performedById: req.user?._id,
      meta: {},
    });
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
