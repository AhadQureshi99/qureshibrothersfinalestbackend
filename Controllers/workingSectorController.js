const WorkingSector = require("../models/workingSectorModel");

// Create working sector
const createWorkingSector = async (req, res) => {
  try {
    const { name, description } = req.body;

    const workingSector = await WorkingSector.create({
      name,
      description,
      createdBy: req.user._id,
    });

    return res.status(201).json({
      message: "Working Sector created successfully",
      workingSector,
    });
  } catch (err) {
    console.error(err);
    if (err.code === 11000) {
      return res
        .status(400)
        .json({ message: "Working Sector name already exists" });
    }
    return res.status(500).json({ message: "Server error" });
  }
};

// List working sectors
const listWorkingSectors = async (req, res) => {
  try {
    const workingSectors = await WorkingSector.find()
      .sort({ createdAt: -1 })
      .populate("createdBy", "username email");
    return res.json({ sectors: workingSectors });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Server error" });
  }
};

// Update working sector
const updateWorkingSector = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description, isActive } = req.body;

    const updatedSector = await WorkingSector.findByIdAndUpdate(
      id,
      { name, description, isActive },
      { new: true }
    );

    if (!updatedSector) {
      return res.status(404).json({ message: "Working Sector not found" });
    }

    return res.json({
      message: "Working Sector updated successfully",
      workingSector: updatedSector,
    });
  } catch (err) {
    console.error(err);
    if (err.code === 11000) {
      return res
        .status(400)
        .json({ message: "Working Sector name already exists" });
    }
    return res.status(500).json({ message: "Server error" });
  }
};

// Delete working sector
const deleteWorkingSector = async (req, res) => {
  try {
    const { id } = req.params;
    const sector = await WorkingSector.findById(id);

    if (!sector) {
      return res.status(404).json({ message: "Working Sector not found" });
    }

    await WorkingSector.findByIdAndDelete(id);
    return res.json({ message: "Working Sector deleted successfully" });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Server error" });
  }
};

// Toggle active status
const toggleWorkingSectorStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const sector = await WorkingSector.findById(id);

    if (!sector) {
      return res.status(404).json({ message: "Working Sector not found" });
    }

    sector.isActive = !sector.isActive;
    await sector.save();

    return res.json({
      message: `Working Sector ${
        sector.isActive ? "activated" : "deactivated"
      } successfully`,
      workingSector: sector,
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Server error" });
  }
};

module.exports = {
  createWorkingSector,
  listWorkingSectors,
  updateWorkingSector,
  deleteWorkingSector,
  toggleWorkingSectorStatus,
};
