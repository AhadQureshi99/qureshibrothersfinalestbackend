const EducationLevel = require("../models/educationLevelModel");

// Create education level
const createEducationLevel = async (req, res) => {
  try {
    const { name } = req.body;

    const educationLevel = await EducationLevel.create({
      name,
      createdBy: req.user._id,
    });

    return res.status(201).json({
      message: "Education Level created successfully",
      educationLevel,
    });
  } catch (err) {
    console.error(err);
    if (err.code === 11000) {
      return res
        .status(400)
        .json({ message: "Education Level name already exists" });
    }
    return res.status(500).json({ message: "Server error" });
  }
};

// List education levels
const listEducationLevels = async (req, res) => {
  try {
    const educationLevels = await EducationLevel.find()
      .sort({ createdAt: -1 })
      .populate("createdBy", "username email");
    return res.json({ educationLevels });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Server error" });
  }
};

// Update education level
const updateEducationLevel = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, isActive } = req.body;

    const updatedEducationLevel = await EducationLevel.findByIdAndUpdate(
      id,
      { name, isActive },
      { new: true }
    );

    if (!updatedEducationLevel) {
      return res.status(404).json({ message: "Education Level not found" });
    }

    return res.json({
      message: "Education Level updated successfully",
      educationLevel: updatedEducationLevel,
    });
  } catch (err) {
    console.error(err);
    if (err.code === 11000) {
      return res
        .status(400)
        .json({ message: "Education Level name already exists" });
    }
    return res.status(500).json({ message: "Server error" });
  }
};

// Delete education level
const deleteEducationLevel = async (req, res) => {
  try {
    const { id } = req.params;
    const educationLevel = await EducationLevel.findById(id);

    if (!educationLevel) {
      return res.status(404).json({ message: "Education Level not found" });
    }

    await EducationLevel.findByIdAndDelete(id);
    return res.json({ message: "Education Level deleted successfully" });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Server error" });
  }
};

// Toggle active status
const toggleEducationLevelStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const educationLevel = await EducationLevel.findById(id);

    if (!educationLevel) {
      return res.status(404).json({ message: "Education Level not found" });
    }

    educationLevel.isActive = !educationLevel.isActive;
    await educationLevel.save();

    return res.json({
      message: `Education Level ${
        educationLevel.isActive ? "activated" : "deactivated"
      } successfully`,
      educationLevel,
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Server error" });
  }
};

module.exports = {
  createEducationLevel,
  listEducationLevels,
  updateEducationLevel,
  deleteEducationLevel,
  toggleEducationLevelStatus,
};
