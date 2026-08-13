const TravelAgent = require("../models/travelAgentModel");
const path = require("path");
const fs = require("fs");

const nextAgentCode = async () => {
  const agents = await TravelAgent.find({}, "code").lean();
  const highestNumber = agents.reduce((highest, agent) => {
    const match = /^TAG-(\d+)$/.exec(agent.code || "");
    return match ? Math.max(highest, Number(match[1])) : highest;
  }, 0);
  return `TAG-${String(highestNumber + 1).padStart(4, "0")}`;
};

const { createLog } = require("./activityLogController");

// Create travel agent
const createTravelAgent = async (req, res) => {
  try {
    const { name, email, phone, address, password } = req.body;

    if (!password) {
      return res.status(400).json({
        message: "Password is required",
      });
    }

    // Handle logo upload
    let logo = null;
    if (req.file) {
      logo = req.file.path;
    }

    let travelAgent;
    for (let attempt = 0; attempt < 5; attempt += 1) {
      try {
        travelAgent = await TravelAgent.create({
          code: await nextAgentCode(),
          name,
          email,
          phone,
          address,
          password,
          logo,
          createdBy: req.user._id,
        });
        break;
      } catch (error) {
        if (error.code !== 11000 || attempt === 4) throw error;
      }
    }

    // Return travel agent without the password hash
    const agentDoc = travelAgent.toObject();
    delete agentDoc.password;

    // Log activity
    await createLog({
      action: "created",
      entityType: "TravelAgent",
      entityId: travelAgent._id,
      entityName: travelAgent.name || travelAgent._id,
      description: `New travel agent ${
        travelAgent.name || travelAgent._id
      } has been created by ${req.user?.username || "System"}`,
      performedBy: req.user?.username || "System",
      performedById: req.user?._id,
      meta: {},
    });
    return res.status(201).json({
      message: "Travel Agent created successfully",
      travelAgent: agentDoc,
    });
  } catch (err) {
    console.error(err);
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
    const { name, email, phone, address, password } = req.body;

    // Handle logo upload
    let logo = null;
    if (req.file) {
      logo = req.file.path;
    }

    // Fetch travel agent and update fields (use save() so pre-save hooks run for password)
    const travelAgent = await TravelAgent.findById(id);
    if (!travelAgent) {
      return res.status(404).json({ message: "Travel Agent not found" });
    }

    travelAgent.name = name || travelAgent.name;
    travelAgent.email = email || travelAgent.email;
    travelAgent.phone = phone || travelAgent.phone;
    travelAgent.address = address || travelAgent.address;
    if (logo) travelAgent.logo = logo;
    if (password) travelAgent.password = password; // will be hashed by pre-save

    const updatedAgent = await travelAgent.save();

    // Log activity
    await createLog({
      action: "updated",
      entityType: "TravelAgent",
      entityId: updatedAgent._id,
      entityName: updatedAgent.name || updatedAgent._id,
      description: `Travel Agent ${
        updatedAgent.name || updatedAgent._id
      } has been updated by ${req.user?.username || "System"}`,
      performedBy: req.user?.username || "System",
      performedById: req.user?._id,
      meta: {},
    });
    return res.json({
      message: "Travel Agent updated successfully",
      travelAgent: updatedAgent,
    });
  } catch (err) {
    console.error(err);
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

    // Delete associated logo
    if (agent.logo) {
      const fullPath = path.join(__dirname, "..", agent.logo);
      if (fs.existsSync(fullPath)) {
        fs.unlinkSync(fullPath);
      }
    }

    const deleted = await TravelAgent.findByIdAndDelete(id);
    // Log activity
    await createLog({
      action: "deleted",
      entityType: "TravelAgent",
      entityId: deleted?._id,
      entityName: deleted?.name || deleted?._id,
      description: `The Travel Agent ${
        deleted?.name || deleted?._id
      } has been deleted by ${req.user?.username || "System"}`,
      performedBy: req.user?.username || "System",
      performedById: req.user?._id,
      meta: {},
    });
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

