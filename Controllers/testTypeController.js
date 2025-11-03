const TestType = require("../models/testTypeModel");

// Create test type
const createTestType = async (req, res) => {
  try {
    const { testType } = req.body;

    const testTypeDoc = await TestType.create({
      testType,
      createdBy: req.user._id,
    });

    return res.status(201).json({
      message: "Test Type created successfully",
      testType: testTypeDoc,
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Server error" });
  }
};

// List test types
const listTestTypes = async (req, res) => {
  try {
    const testTypes = await TestType.find()
      .sort({ createdAt: -1 })
      .populate("createdBy", "username email");
    return res.json({ testTypes });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Server error" });
  }
};

// Update test type
const updateTestType = async (req, res) => {
  try {
    const { id } = req.params;
    const { testType, isActive } = req.body;

    const updatedTestType = await TestType.findByIdAndUpdate(
      id,
      { testType, isActive },
      { new: true }
    );

    if (!updatedTestType) {
      return res.status(404).json({ message: "Test Type not found" });
    }

    return res.json({
      message: "Test Type updated successfully",
      testType: updatedTestType,
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Server error" });
  }
};

// Delete test type
const deleteTestType = async (req, res) => {
  try {
    const { id } = req.params;
    const testType = await TestType.findById(id);

    if (!testType) {
      return res.status(404).json({ message: "Test Type not found" });
    }

    await TestType.findByIdAndDelete(id);
    return res.json({ message: "Test Type deleted successfully" });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Server error" });
  }
};

// Toggle active status
const toggleTestTypeStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const testType = await TestType.findById(id);

    if (!testType) {
      return res.status(404).json({ message: "Test Type not found" });
    }

    testType.isActive = !testType.isActive;
    await testType.save();

    return res.json({
      message: `Test Type ${
        testType.isActive ? "activated" : "deactivated"
      } successfully`,
      testType,
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Server error" });
  }
};

module.exports = {
  createTestType,
  listTestTypes,
  updateTestType,
  deleteTestType,
  toggleTestTypeStatus,
};
