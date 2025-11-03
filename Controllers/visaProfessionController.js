const VisaProfession = require("../models/visaProfessionModel");

// Create visa profession
const createVisaProfession = async (req, res) => {
  try {
    const { name, description } = req.body;

    const visaProfession = await VisaProfession.create({
      name,
      description,
      createdBy: req.user._id,
    });

    return res.status(201).json({
      message: "Visa Profession created successfully",
      visaProfession,
    });
  } catch (err) {
    console.error(err);
    if (err.code === 11000) {
      return res
        .status(400)
        .json({ message: "Visa Profession name already exists" });
    }
    return res.status(500).json({ message: "Server error" });
  }
};

// List visa professions
const listVisaProfessions = async (req, res) => {
  try {
    const visaProfessions = await VisaProfession.find()
      .sort({ createdAt: -1 })
      .populate("createdBy", "username email");
    return res.json({ professions: visaProfessions });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Server error" });
  }
};

// Update visa profession
const updateVisaProfession = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description, isActive } = req.body;

    const updatedProfession = await VisaProfession.findByIdAndUpdate(
      id,
      { name, description, isActive },
      { new: true }
    );

    if (!updatedProfession) {
      return res.status(404).json({ message: "Visa Profession not found" });
    }

    return res.json({
      message: "Visa Profession updated successfully",
      visaProfession: updatedProfession,
    });
  } catch (err) {
    console.error(err);
    if (err.code === 11000) {
      return res
        .status(400)
        .json({ message: "Visa Profession name already exists" });
    }
    return res.status(500).json({ message: "Server error" });
  }
};

// Delete visa profession
const deleteVisaProfession = async (req, res) => {
  try {
    const { id } = req.params;
    const profession = await VisaProfession.findById(id);

    if (!profession) {
      return res.status(404).json({ message: "Visa Profession not found" });
    }

    await VisaProfession.findByIdAndDelete(id);
    return res.json({ message: "Visa Profession deleted successfully" });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Server error" });
  }
};

// Toggle active status
const toggleVisaProfessionStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const profession = await VisaProfession.findById(id);

    if (!profession) {
      return res.status(404).json({ message: "Visa Profession not found" });
    }

    profession.isActive = !profession.isActive;
    await profession.save();

    return res.json({
      message: `Visa Profession ${
        profession.isActive ? "activated" : "deactivated"
      } successfully`,
      visaProfession: profession,
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Server error" });
  }
};

module.exports = {
  createVisaProfession,
  listVisaProfessions,
  updateVisaProfession,
  deleteVisaProfession,
  toggleVisaProfessionStatus,
};
