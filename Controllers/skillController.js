const Skill = require("../models/skillModel");
const asyncHandler = require("express-async-handler");

// Get all skills
const getSkills = asyncHandler(async (req, res) => {
  const skills = await Skill.find({})
    .populate("createdBy", "username")
    .sort({ createdAt: -1 });
  res.json({ skills });
});

// Create a new skill
const createSkill = asyncHandler(async (req, res) => {
  const { name } = req.body;

  if (!name) {
    res.status(400);
    throw new Error("Skill name is required");
  }

  // Check if skill already exists
  const skillExists = await Skill.findOne({
    name: { $regex: new RegExp(`^${name}$`, "i") },
  });
  if (skillExists) {
    res.status(400);
    throw new Error("Skill already exists");
  }

  const skill = await Skill.create({
    name,
    createdBy: req.user._id,
  });

  res.status(201).json({
    message: "Skill created successfully",
    skill,
  });
});

// Update a skill
const updateSkill = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { name } = req.body;

  if (!name) {
    res.status(400);
    throw new Error("Skill name is required");
  }

  // Check if another skill with same name exists
  const skillExists = await Skill.findOne({
    name: { $regex: new RegExp(`^${name}$`, "i") },
    _id: { $ne: id },
  });
  if (skillExists) {
    res.status(400);
    throw new Error("Skill name already exists");
  }

  const skill = await Skill.findByIdAndUpdate(id, { name }, { new: true });

  if (!skill) {
    res.status(404);
    throw new Error("Skill not found");
  }

  res.json({
    message: "Skill updated successfully",
    skill,
  });
});

// Delete a skill
const deleteSkill = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const skill = await Skill.findByIdAndDelete(id);

  if (!skill) {
    res.status(404);
    throw new Error("Skill not found");
  }

  res.json({
    message: "Skill deleted successfully",
  });
});

// Toggle skill status
const toggleSkillStatus = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const skill = await Skill.findById(id);

  if (!skill) {
    res.status(404);
    throw new Error("Skill not found");
  }

  skill.isActive = !skill.isActive;
  await skill.save();

  res.json({
    message: `Skill ${
      skill.isActive ? "activated" : "deactivated"
    } successfully`,
    skill,
  });
});

module.exports = {
  getSkills,
  createSkill,
  updateSkill,
  deleteSkill,
  toggleSkillStatus,
};
