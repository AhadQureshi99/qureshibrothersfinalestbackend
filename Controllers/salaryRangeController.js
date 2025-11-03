const SalaryRange = require("../models/salaryRangeModel");

const createSalaryRange = async (req, res) => {
  try {
    const { salaryRange } = req.body;
    const createdBy = req.user.id;

    const existingSalaryRange = await SalaryRange.findOne({ salaryRange });
    if (existingSalaryRange) {
      return res.status(400).json({ message: "Salary Range already exists" });
    }

    const newSalaryRange = new SalaryRange({
      salaryRange,
      createdBy,
    });

    await newSalaryRange.save();
    res.status(201).json({
      message: "Salary Range created successfully",
      salaryRange: newSalaryRange,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const listSalaryRanges = async (req, res) => {
  try {
    const salaryRanges = await SalaryRange.find()
      .populate("createdBy", "username email")
      .sort({ createdAt: -1 });
    res.status(200).json({ salaryRanges });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const updateSalaryRange = async (req, res) => {
  try {
    const { id } = req.params;
    const { salaryRange } = req.body;

    const existingSalaryRange = await SalaryRange.findOne({
      salaryRange,
      _id: { $ne: id },
    });
    if (existingSalaryRange) {
      return res.status(400).json({ message: "Salary Range already exists" });
    }

    const updatedSalaryRange = await SalaryRange.findByIdAndUpdate(
      id,
      { salaryRange },
      { new: true }
    );

    if (!updatedSalaryRange) {
      return res.status(404).json({ message: "Salary Range not found" });
    }

    res.status(200).json({
      message: "Salary Range updated successfully",
      salaryRange: updatedSalaryRange,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const toggleSalaryRangeStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const salaryRange = await SalaryRange.findById(id);

    if (!salaryRange) {
      return res.status(404).json({ message: "Salary Range not found" });
    }

    salaryRange.isActive = !salaryRange.isActive;
    await salaryRange.save();

    res.status(200).json({
      message: salaryRange.isActive
        ? "Salary Range activated successfully"
        : "Salary Range deactivated successfully",
      salaryRange,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const deleteSalaryRange = async (req, res) => {
  try {
    const { id } = req.params;
    const deletedSalaryRange = await SalaryRange.findByIdAndDelete(id);

    if (!deletedSalaryRange) {
      return res.status(404).json({ message: "Salary Range not found" });
    }

    res.status(200).json({ message: "Salary Range deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  createSalaryRange,
  listSalaryRanges,
  updateSalaryRange,
  toggleSalaryRangeStatus,
  deleteSalaryRange,
};
