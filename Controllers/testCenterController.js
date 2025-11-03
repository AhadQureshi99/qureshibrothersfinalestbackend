const TestCenter = require("../models/testCenterModel");

// Create test center
const createTestCenter = async (req, res) => {
  try {
    const { name, email, contactPerson, phone, location, address } = req.body;

    const testCenter = await TestCenter.create({
      name,
      email,
      contactPerson,
      phone,
      location,
      address,
      createdBy: req.user._id,
    });

    return res.status(201).json({
      message: "Test Center created successfully",
      testCenter,
    });
  } catch (err) {
    console.error(err);
    if (err.code === 11000) {
      return res
        .status(400)
        .json({ message: "Test Center name already exists" });
    }
    return res.status(500).json({ message: "Server error" });
  }
};

// List test centers
const listTestCenters = async (req, res) => {
  try {
    const testCenters = await TestCenter.find()
      .sort({ createdAt: -1 })
      .populate("createdBy", "username email");
    return res.json({ testCenters });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Server error" });
  }
};

// Update test center
const updateTestCenter = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, email, contactPerson, phone, location, address, isActive } =
      req.body;

    const updatedTestCenter = await TestCenter.findByIdAndUpdate(
      id,
      { name, email, contactPerson, phone, location, address, isActive },
      { new: true }
    );

    if (!updatedTestCenter) {
      return res.status(404).json({ message: "Test Center not found" });
    }

    return res.json({
      message: "Test Center updated successfully",
      testCenter: updatedTestCenter,
    });
  } catch (err) {
    console.error(err);
    if (err.code === 11000) {
      return res
        .status(400)
        .json({ message: "Test Center name already exists" });
    }
    return res.status(500).json({ message: "Server error" });
  }
};

// Delete test center
const deleteTestCenter = async (req, res) => {
  try {
    const { id } = req.params;
    const testCenter = await TestCenter.findById(id);

    if (!testCenter) {
      return res.status(404).json({ message: "Test Center not found" });
    }

    await TestCenter.findByIdAndDelete(id);
    return res.json({ message: "Test Center deleted successfully" });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Server error" });
  }
};

// Toggle active status
const toggleTestCenterStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const testCenter = await TestCenter.findById(id);

    if (!testCenter) {
      return res.status(404).json({ message: "Test Center not found" });
    }

    testCenter.isActive = !testCenter.isActive;
    await testCenter.save();

    return res.json({
      message: `Test Center ${
        testCenter.isActive ? "activated" : "deactivated"
      } successfully`,
      testCenter,
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Server error" });
  }
};

module.exports = {
  createTestCenter,
  listTestCenters,
  updateTestCenter,
  deleteTestCenter,
  toggleTestCenterStatus,
};
