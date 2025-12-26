const EmployerPlan = require("../models/employerPlanModel");

// Get all employer plans
const getEmployerPlans = async (req, res) => {
  try {
    const plans = await EmployerPlan.find();
    res.status(200).json({ plans });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error fetching employer plans", error: error.message });
  }
};

// Get single employer plan
const getEmployerPlan = async (req, res) => {
  try {
    const plan = await EmployerPlan.findById(req.params.id);
    if (!plan) {
      return res.status(404).json({ message: "Employer plan not found" });
    }
    res.status(200).json({ plan });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error fetching employer plan", error: error.message });
  }
};

// Create employer plan
const { createLog } = require("./activityLogController");
const createEmployerPlan = async (req, res) => {
  try {
    const {
      name,
      amount,
      validForDays,
      maxJobsAllowed,
      supportsFeaturedJobs,
      allowedNumberOfFeaturedJobs,
      featuredJobAmount,
      featuredEmployerAmount,
    } = req.body;

    // Check if plan with name already exists
    const existingPlan = await EmployerPlan.findOne({ name });
    if (existingPlan) {
      return res
        .status(400)
        .json({ message: "Employer plan with this name already exists" });
    }

    const plan = new EmployerPlan({
      name,
      amount: parseFloat(amount),
      validForDays: parseInt(validForDays),
      maxJobsAllowed: parseInt(maxJobsAllowed),
      supportsFeaturedJobs:
        supportsFeaturedJobs === "true" || supportsFeaturedJobs === true,
      allowedNumberOfFeaturedJobs: parseInt(allowedNumberOfFeaturedJobs),
      featuredJobAmount: parseFloat(featuredJobAmount),
      featuredEmployerAmount: parseFloat(featuredEmployerAmount),
    });

    await plan.save();
    // Log activity
    await createLog({
      action: "created",
      entityType: "EmployerPlan",
      entityId: plan._id,
      entityName: plan.name || plan._id,
      description: `New employer plan ${
        plan.name || plan._id
      } has been created by ${req.user?.username || "System"}`,
      performedBy: req.user?.username || "System",
      performedById: req.user?._id,
      meta: {},
    });
    res
      .status(201)
      .json({ message: "Employer plan created successfully", plan });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error creating employer plan", error: error.message });
  }
};

// Update employer plan
const updateEmployerPlan = async (req, res) => {
  try {
    const {
      name,
      amount,
      validForDays,
      maxJobsAllowed,
      supportsFeaturedJobs,
      allowedNumberOfFeaturedJobs,
      featuredJobAmount,
      featuredEmployerAmount,
    } = req.body;

    const plan = await EmployerPlan.findById(req.params.id);
    if (!plan) {
      return res.status(404).json({ message: "Employer plan not found" });
    }

    // Check if name conflicts with other plans
    const existingPlan = await EmployerPlan.findOne({
      name,
      _id: { $ne: req.params.id },
    });
    if (existingPlan) {
      return res
        .status(400)
        .json({ message: "Employer plan with this name already exists" });
    }

    // Update fields
    plan.name = name;
    plan.amount = parseFloat(amount);
    plan.validForDays = parseInt(validForDays);
    plan.maxJobsAllowed = parseInt(maxJobsAllowed);
    plan.supportsFeaturedJobs =
      supportsFeaturedJobs === "true" || supportsFeaturedJobs === true;
    plan.allowedNumberOfFeaturedJobs = parseInt(allowedNumberOfFeaturedJobs);
    plan.featuredJobAmount = parseFloat(featuredJobAmount);
    plan.featuredEmployerAmount = parseFloat(featuredEmployerAmount);

    await plan.save();
    // Log activity
    await createLog({
      action: "updated",
      entityType: "EmployerPlan",
      entityId: plan._id,
      entityName: plan.name || plan._id,
      description: `Employer plan ${
        plan.name || plan._id
      } has been updated by ${req.user?.username || "System"}`,
      performedBy: req.user?.username || "System",
      performedById: req.user?._id,
      meta: {},
    });
    res
      .status(200)
      .json({ message: "Employer plan updated successfully", plan });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error updating employer plan", error: error.message });
  }
};

// Delete employer plan
const deleteEmployerPlan = async (req, res) => {
  try {
    const plan = await EmployerPlan.findByIdAndDelete(req.params.id);
    if (!plan) {
      return res.status(404).json({ message: "Employer plan not found" });
    }
    // Log activity
    await createLog({
      action: "deleted",
      entityType: "EmployerPlan",
      entityId: plan._id,
      entityName: plan.name || plan._id,
      description: `The Employer plan ${
        plan.name || plan._id
      } has been deleted by ${req.user?.username || "System"}`,
      performedBy: req.user?.username || "System",
      performedById: req.user?._id,
      meta: {},
    });
    res.status(200).json({ message: "Employer plan deleted successfully" });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error deleting employer plan", error: error.message });
  }
};

module.exports = {
  getEmployerPlans,
  getEmployerPlan,
  createEmployerPlan,
  updateEmployerPlan,
  deleteEmployerPlan,
};
