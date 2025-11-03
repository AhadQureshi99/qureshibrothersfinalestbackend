const RecruitmentAgent = require("../models/recruitmentAgentModel");
const path = require("path");
const fs = require("fs");

// Create recruitment agent
const createRecruitmentAgent = async (req, res) => {
  try {
    const {
      code,
      name,
      location,
      cnic,
      passportNo,
      primaryEmail,
      secondaryEmail,
      primaryPhone,
      secondaryPhone,
    } = req.body;

    // Handle file uploads
    let files = [];
    if (req.files && req.files.length > 0) {
      files = req.files.map((file) => file.path);
    }

    const recruitmentAgent = await RecruitmentAgent.create({
      code,
      name,
      location,
      cnic,
      passportNo,
      primaryEmail,
      secondaryEmail,
      primaryPhone,
      secondaryPhone,
      files,
      createdBy: req.user._id,
    });

    return res.status(201).json({
      message: "Recruitment Agent created successfully",
      recruitmentAgent,
    });
  } catch (err) {
    console.error(err);
    if (err.code === 11000) {
      return res.status(400).json({ message: "Code already exists" });
    }
    return res.status(500).json({ message: "Server error" });
  }
};

// List recruitment agents
const listRecruitmentAgents = async (req, res) => {
  try {
    const recruitmentAgents = await RecruitmentAgent.find()
      .sort({ createdAt: -1 })
      .populate("createdBy", "username email");
    return res.json({ agents: recruitmentAgents });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Server error" });
  }
};

// Update recruitment agent
const updateRecruitmentAgent = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      code,
      name,
      location,
      cnic,
      passportNo,
      primaryEmail,
      secondaryEmail,
      primaryPhone,
      secondaryPhone,
    } = req.body;

    // Handle file uploads
    let files = [];
    if (req.files && req.files.length > 0) {
      files = req.files.map((file) => file.path);
    }

    const updateData = {
      code,
      name,
      location,
      cnic,
      passportNo,
      primaryEmail,
      secondaryEmail,
      primaryPhone,
      secondaryPhone,
    };

    if (files.length > 0) {
      updateData.files = files;
    }

    const updatedAgent = await RecruitmentAgent.findByIdAndUpdate(
      id,
      updateData,
      {
        new: true,
      }
    );

    if (!updatedAgent) {
      return res.status(404).json({ message: "Recruitment Agent not found" });
    }

    return res.json({
      message: "Recruitment Agent updated successfully",
      recruitmentAgent: updatedAgent,
    });
  } catch (err) {
    console.error(err);
    if (err.code === 11000) {
      return res.status(400).json({ message: "Code already exists" });
    }
    return res.status(500).json({ message: "Server error" });
  }
};

// Delete recruitment agent
const deleteRecruitmentAgent = async (req, res) => {
  try {
    const { id } = req.params;
    const agent = await RecruitmentAgent.findById(id);

    if (!agent) {
      return res.status(404).json({ message: "Recruitment Agent not found" });
    }

    // Delete associated files
    if (agent.files && agent.files.length > 0) {
      agent.files.forEach((filePath) => {
        const fullPath = path.join(__dirname, "..", filePath);
        if (fs.existsSync(fullPath)) {
          fs.unlinkSync(fullPath);
        }
      });
    }

    await RecruitmentAgent.findByIdAndDelete(id);
    return res.json({ message: "Recruitment Agent deleted successfully" });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Server error" });
  }
};

module.exports = {
  createRecruitmentAgent,
  listRecruitmentAgents,
  updateRecruitmentAgent,
  deleteRecruitmentAgent,
};
