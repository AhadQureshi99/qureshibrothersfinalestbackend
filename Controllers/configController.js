const PaymentAgent = require("../models/paymentAgentModel");
const path = require("path");
const fs = require("fs");

// Create payment agent
const createPaymentAgent = async (req, res) => {
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

    const paymentAgent = await PaymentAgent.create({
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
      message: "Payment Agent created successfully",
      paymentAgent,
    });
  } catch (err) {
    console.error(err);
    if (err.code === 11000) {
      return res.status(400).json({ message: "Code already exists" });
    }
    return res.status(500).json({ message: "Server error" });
  }
};

// List payment agents
const listPaymentAgents = async (req, res) => {
  try {
    const paymentAgents = await PaymentAgent.find()
      .sort({ createdAt: -1 })
      .populate("createdBy", "username email");
    return res.json({ agents: paymentAgents });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Server error" });
  }
};

// Update payment agent
const updatePaymentAgent = async (req, res) => {
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

    const updatedAgent = await PaymentAgent.findByIdAndUpdate(id, updateData, {
      new: true,
    });

    if (!updatedAgent) {
      return res.status(404).json({ message: "Payment Agent not found" });
    }

    return res.json({
      message: "Payment Agent updated successfully",
      paymentAgent: updatedAgent,
    });
  } catch (err) {
    console.error(err);
    if (err.code === 11000) {
      return res.status(400).json({ message: "Code already exists" });
    }
    return res.status(500).json({ message: "Server error" });
  }
};

// Delete payment agent
const deletePaymentAgent = async (req, res) => {
  try {
    const { id } = req.params;
    const agent = await PaymentAgent.findById(id);

    if (!agent) {
      return res.status(404).json({ message: "Payment Agent not found" });
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

    await PaymentAgent.findByIdAndDelete(id);
    return res.json({ message: "Payment Agent deleted successfully" });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Server error" });
  }
};

module.exports = {
  createPaymentAgent,
  listPaymentAgents,
  updatePaymentAgent,
  deletePaymentAgent,
};
