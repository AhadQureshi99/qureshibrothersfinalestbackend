const CareerLevel = require("../models/careerLevelModel");

// Create career level
const createCareerLevel = async (req, res) => {
  try {
    const { name } = req.body;

    const careerLevel = await CareerLevel.create({
      name,
      createdBy: req.user._id,
    });

    return res.status(201).json({
      message: "Career Level created successfully",
      careerLevel,
    });
  } catch (err) {
    console.error(err);
    if (err.code === 11000) {
      return res
        .status(400)
        .json({ message: "Career Level name already exists" });
    }
    return res.status(500).json({ message: "Server error" });
  }
};

// List career levels
const listCareerLevels = async (req, res) => {
  try {
    const careerLevels = await CareerLevel.find()
      .sort({ createdAt: -1 })
      .populate("createdBy", "username email");
    return res.json({ careerLevels });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Server error" });
  }
};

// Update career level
const updateCareerLevel = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, isActive } = req.body;

    const updatedCareerLevel = await CareerLevel.findByIdAndUpdate(
      id,
      { name, isActive },
      { new: true }
    );

    if (!updatedCareerLevel) {
      return res.status(404).json({ message: "Career Level not found" });
    }

    return res.json({
      message: "Career Level updated successfully",
      careerLevel: updatedCareerLevel,
    });
  } catch (err) {
    console.error(err);
    if (err.code === 11000) {
      return res
        .status(400)
        .json({ message: "Career Level name already exists" });
    }
    return res.status(500).json({ message: "Server error" });
  }
};

// Delete career level
const deleteCareerLevel = async (req, res) => {
  try {
    const { id } = req.params;
    const careerLevel = await CareerLevel.findById(id);

    if (!careerLevel) {
      return res.status(404).json({ message: "Career Level not found" });
    }

    await CareerLevel.findByIdAndDelete(id);
    return res.json({ message: "Career Level deleted successfully" });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Server error" });
  }
};

// Toggle active status
const toggleCareerLevelStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const careerLevel = await CareerLevel.findById(id);

    if (!careerLevel) {
      return res.status(404).json({ message: "Career Level not found" });
    }

    careerLevel.isActive = !careerLevel.isActive;
    await careerLevel.save();

    return res.json({
      message: `Career Level ${
        careerLevel.isActive ? "activated" : "deactivated"
      } successfully`,
      careerLevel,
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Server error" });
  }
};

module.exports = {
  createCareerLevel,
  listCareerLevels,
  updateCareerLevel,
  deleteCareerLevel,
  toggleCareerLevelStatus,
};
