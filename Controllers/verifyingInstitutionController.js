const VerifyingInstitution = require("../models/verifyingInstitutionModel");

// Create verifying institution
const { createLog } = require("./activityLogController");
const createVerifyingInstitution = async (req, res) => {
  try {
    const { name, type } = req.body;

    const verifyingInstitution = await VerifyingInstitution.create({
      name,
      type,
      createdBy: req.user._id,
    });
    // Log activity
    await createLog({
      action: "created",
      entityType: "VerifyingInstitution",
      entityId: verifyingInstitution._id,
      entityName: verifyingInstitution.name || verifyingInstitution._id,
      description: `New verifying institution ${
        verifyingInstitution.name || verifyingInstitution._id
      } has been created by ${req.user?.username || "System"}`,
      performedBy: req.user?.username || "System",
      performedById: req.user?._id,
      meta: {},
    });
    return res.status(201).json({
      message: "Verifying Institution created successfully",
      verifyingInstitution,
    });
  } catch (err) {
    console.error(err);
    if (err.code === 11000) {
      return res
        .status(400)
        .json({ message: "Verifying Institution name already exists" });
    }
    return res.status(500).json({ message: "Server error" });
  }
};

// List verifying institutions
const listVerifyingInstitutions = async (req, res) => {
  try {
    const verifyingInstitutions = await VerifyingInstitution.find()
      .sort({ createdAt: -1 })
      .populate("createdBy", "username email");
    return res.json({ institutions: verifyingInstitutions });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Server error" });
  }
};

// Update verifying institution
const updateVerifyingInstitution = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, type, isActive } = req.body;

    const updatedInstitution = await VerifyingInstitution.findByIdAndUpdate(
      id,
      { name, type, isActive },
      { new: true }
    );

    if (!updatedInstitution) {
      return res
        .status(404)
        .json({ message: "Verifying Institution not found" });
    }

    // Log activity
    await createLog({
      action: "updated",
      entityType: "VerifyingInstitution",
      entityId: updatedInstitution._id,
      entityName: updatedInstitution.name || updatedInstitution._id,
      description: `Verifying Institution ${
        updatedInstitution.name || updatedInstitution._id
      } has been updated by ${req.user?.username || "System"}`,
      performedBy: req.user?.username || "System",
      performedById: req.user?._id,
      meta: {},
    });
    return res.json({
      message: "Verifying Institution updated successfully",
      verifyingInstitution: updatedInstitution,
    });
  } catch (err) {
    console.error(err);
    if (err.code === 11000) {
      return res
        .status(400)
        .json({ message: "Verifying Institution name already exists" });
    }
    return res.status(500).json({ message: "Server error" });
  }
};

// Delete verifying institution
const deleteVerifyingInstitution = async (req, res) => {
  try {
    const { id } = req.params;
    const institution = await VerifyingInstitution.findById(id);

    if (!institution) {
      return res
        .status(404)
        .json({ message: "Verifying Institution not found" });
    }

    const deleted = await VerifyingInstitution.findByIdAndDelete(id);
    // Log activity
    await createLog({
      action: "deleted",
      entityType: "VerifyingInstitution",
      entityId: deleted?._id,
      entityName: deleted?.name || deleted?._id,
      description: `The Verifying Institution ${
        deleted?.name || deleted?._id
      } has been deleted by ${req.user?.username || "System"}`,
      performedBy: req.user?.username || "System",
      performedById: req.user?._id,
      meta: {},
    });
    return res.json({ message: "Verifying Institution deleted successfully" });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Server error" });
  }
};

// Toggle active status
const toggleVerifyingInstitutionStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const institution = await VerifyingInstitution.findById(id);

    if (!institution) {
      return res
        .status(404)
        .json({ message: "Verifying Institution not found" });
    }

    institution.isActive = !institution.isActive;
    await institution.save();

    return res.json({
      message: `Verifying Institution ${
        institution.isActive ? "activated" : "deactivated"
      } successfully`,
      verifyingInstitution: institution,
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Server error" });
  }
};

module.exports = {
  createVerifyingInstitution,
  listVerifyingInstitutions,
  updateVerifyingInstitution,
  deleteVerifyingInstitution,
  toggleVerifyingInstitutionStatus,
};
