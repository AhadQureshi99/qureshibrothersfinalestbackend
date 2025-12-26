const ExperienceRange = require("../models/experienceRangeModel");
const { createLog } = require("./activityLogController");

const createExperienceRange = async (req, res) => {
  try {
    const { experienceRange } = req.body;
    const createdBy = req.user.id;

    const existingExperienceRange = await ExperienceRange.findOne({
      experienceRange,
    });
    if (existingExperienceRange) {
      return res
        .status(400)
        .json({ message: "Experience Range already exists" });
    }

    const newExperienceRange = new ExperienceRange({
      experienceRange,
      createdBy,
    });

    await newExperienceRange.save();
    // Log activity
    await createLog({
      action: "created",
      entityType: "ExperienceRange",
      entityId: newExperienceRange._id,
      entityName: newExperienceRange.experienceRange || newExperienceRange._id,
      description: `New experience range ${
        newExperienceRange.experienceRange || newExperienceRange._id
      } has been created by ${req.user?.username || "System"}`,
      performedBy: req.user?.username || "System",
      performedById: req.user?.id,
      meta: {},
    });
    res.status(201).json({
      message: "Experience Range created successfully",
      experienceRange: newExperienceRange,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const listExperienceRanges = async (req, res) => {
  try {
    const experienceRanges = await ExperienceRange.find()
      .populate("createdBy", "username email")
      .sort({ createdAt: -1 });
    res.status(200).json({ experienceRanges });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const updateExperienceRange = async (req, res) => {
  try {
    const { id } = req.params;
    const { experienceRange } = req.body;

    const existingExperienceRange = await ExperienceRange.findOne({
      experienceRange,
      _id: { $ne: id },
    });
    if (existingExperienceRange) {
      return res
        .status(400)
        .json({ message: "Experience Range already exists" });
    }

    const updatedExperienceRange = await ExperienceRange.findByIdAndUpdate(
      id,
      { experienceRange },
      { new: true }
    );

    if (!updatedExperienceRange) {
      return res.status(404).json({ message: "Experience Range not found" });
    }

    // Log activity
    await createLog({
      action: "updated",
      entityType: "ExperienceRange",
      entityId: updatedExperienceRange._id,
      entityName:
        updatedExperienceRange.experienceRange || updatedExperienceRange._id,
      description: `Experience Range ${
        updatedExperienceRange.experienceRange || updatedExperienceRange._id
      } has been updated by ${req.user?.username || "System"}`,
      performedBy: req.user?.username || "System",
      performedById: req.user?.id,
      meta: {},
    });
    res.status(200).json({
      message: "Experience Range updated successfully",
      experienceRange: updatedExperienceRange,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const toggleExperienceRangeStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const experienceRange = await ExperienceRange.findById(id);

    if (!experienceRange) {
      return res.status(404).json({ message: "Experience Range not found" });
    }

    experienceRange.isActive = !experienceRange.isActive;
    await experienceRange.save();

    res.status(200).json({
      message: experienceRange.isActive
        ? "Experience Range activated successfully"
        : "Experience Range deactivated successfully",
      experienceRange,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const deleteExperienceRange = async (req, res) => {
  try {
    const { id } = req.params;
    const deletedExperienceRange = await ExperienceRange.findByIdAndDelete(id);

    if (!deletedExperienceRange) {
      return res.status(404).json({ message: "Experience Range not found" });
    }
    // Log activity
    await createLog({
      action: "deleted",
      entityType: "ExperienceRange",
      entityId: deletedExperienceRange._id,
      entityName:
        deletedExperienceRange.experienceRange || deletedExperienceRange._id,
      description: `The Experience Range ${
        deletedExperienceRange.experienceRange || deletedExperienceRange._id
      } has been deleted by ${req.user?.username || "System"}`,
      performedBy: req.user?.username || "System",
      performedById: req.user?.id,
      meta: {},
    });
    res.status(200).json({ message: "Experience Range deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  createExperienceRange,
  listExperienceRanges,
  updateExperienceRange,
  toggleExperienceRangeStatus,
  deleteExperienceRange,
};
