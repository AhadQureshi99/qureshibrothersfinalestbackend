const AgeRange = require("../models/ageRangeModel");

// Create age range
const createAgeRange = async (req, res) => {
  try {
    const { ageRange } = req.body;

    const ageRangeDoc = await AgeRange.create({
      ageRange,
      createdBy: req.user._id,
    });

    return res.status(201).json({
      message: "Age Range created successfully",
      ageRange: ageRangeDoc,
    });
  } catch (err) {
    console.error(err);
    if (err.code === 11000) {
      return res.status(400).json({ message: "Age Range already exists" });
    }
    return res.status(500).json({ message: "Server error" });
  }
};

// List age ranges
const listAgeRanges = async (req, res) => {
  try {
    const ageRanges = await AgeRange.find()
      .sort({ createdAt: -1 })
      .populate("createdBy", "username email");
    return res.json({ ageRanges });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Server error" });
  }
};

// Update age range
const updateAgeRange = async (req, res) => {
  try {
    const { id } = req.params;
    const { ageRange, isActive } = req.body;

    const updatedAgeRange = await AgeRange.findByIdAndUpdate(
      id,
      { ageRange, isActive },
      { new: true }
    );

    if (!updatedAgeRange) {
      return res.status(404).json({ message: "Age Range not found" });
    }

    return res.json({
      message: "Age Range updated successfully",
      ageRange: updatedAgeRange,
    });
  } catch (err) {
    console.error(err);
    if (err.code === 11000) {
      return res.status(400).json({ message: "Age Range already exists" });
    }
    return res.status(500).json({ message: "Server error" });
  }
};

// Delete age range
const deleteAgeRange = async (req, res) => {
  try {
    const { id } = req.params;
    const ageRange = await AgeRange.findById(id);

    if (!ageRange) {
      return res.status(404).json({ message: "Age Range not found" });
    }

    await AgeRange.findByIdAndDelete(id);
    return res.json({ message: "Age Range deleted successfully" });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Server error" });
  }
};

// Toggle active status
const toggleAgeRangeStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const ageRange = await AgeRange.findById(id);

    if (!ageRange) {
      return res.status(404).json({ message: "Age Range not found" });
    }

    ageRange.isActive = !ageRange.isActive;
    await ageRange.save();

    return res.json({
      message: `Age Range ${
        ageRange.isActive ? "activated" : "deactivated"
      } successfully`,
      ageRange,
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Server error" });
  }
};

module.exports = {
  createAgeRange,
  listAgeRanges,
  updateAgeRange,
  deleteAgeRange,
  toggleAgeRangeStatus,
};
