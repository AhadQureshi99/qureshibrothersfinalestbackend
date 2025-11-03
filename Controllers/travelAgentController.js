const TravelAgent = require("../models/travelAgentModel");
const path = require("path");
const fs = require("fs");

// Create travel agent
const createTravelAgent = async (req, res) => {
  try {
    const {
      code,
      name,
      location,
      airlinesDealsWith,
      primaryEmail,
      secondaryEmail,
      primaryPhone,
      secondaryPhone,
      address,
    } = req.body;

    // Handle file uploads
    let files = [];
    if (req.files && req.files.length > 0) {
      files = req.files.map((file) => file.path);
    }

    const travelAgent = await TravelAgent.create({
      code,
      name,
      location,
      airlinesDealsWith,
      primaryEmail,
      secondaryEmail,
      primaryPhone,
      secondaryPhone,
      address,
      files,
      createdBy: req.user._id,
    });

    return res.status(201).json({
      message: "Travel Agent created successfully",
      travelAgent,
    });
  } catch (err) {
    console.error(err);
    if (err.code === 11000) {
      return res.status(400).json({ message: "Code already exists" });
    }
    return res.status(500).json({ message: "Server error" });
  }
};

// List travel agents
const listTravelAgents = async (req, res) => {
  try {
    const travelAgents = await TravelAgent.find()
      .sort({ createdAt: -1 })
      .populate("createdBy", "username email");
    return res.json({ agents: travelAgents });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Server error" });
  }
};

// Update travel agent
const updateTravelAgent = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      code,
      name,
      location,
      airlinesDealsWith,
      primaryEmail,
      secondaryEmail,
      primaryPhone,
      secondaryPhone,
      address,
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
      airlinesDealsWith,
      primaryEmail,
      secondaryEmail,
      primaryPhone,
      secondaryPhone,
      address,
    };

    if (files.length > 0) {
      updateData.files = files;
    }

    const updatedAgent = await TravelAgent.findByIdAndUpdate(id, updateData, {
      new: true,
    });

    if (!updatedAgent) {
      return res.status(404).json({ message: "Travel Agent not found" });
    }

    return res.json({
      message: "Travel Agent updated successfully",
      travelAgent: updatedAgent,
    });
  } catch (err) {
    console.error(err);
    if (err.code === 11000) {
      return res.status(400).json({ message: "Code already exists" });
    }
    return res.status(500).json({ message: "Server error" });
  }
};

// Delete travel agent
const deleteTravelAgent = async (req, res) => {
  try {
    const { id } = req.params;
    const agent = await TravelAgent.findById(id);

    if (!agent) {
      return res.status(404).json({ message: "Travel Agent not found" });
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

    await TravelAgent.findByIdAndDelete(id);
    return res.json({ message: "Travel Agent deleted successfully" });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Server error" });
  }
};

module.exports = {
  createTravelAgent,
  listTravelAgents,
  updateTravelAgent,
  deleteTravelAgent,
};
