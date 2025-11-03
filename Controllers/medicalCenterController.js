const MedicalCenter = require("../models/medicalCenterModel");

// Create medical center
const createMedicalCenter = async (req, res) => {
  try {
    const {
      city,
      name,
      phoneNo,
      contactPerson,
      fax,
      email,
      location,
      address,
    } = req.body;

    const medicalCenter = await MedicalCenter.create({
      city,
      name,
      phoneNo,
      contactPerson,
      fax,
      email,
      location,
      address,
      createdBy: req.user._id,
    });

    return res.status(201).json({
      message: "Medical Center created successfully",
      medicalCenter,
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Server error" });
  }
};

// List medical centers
const listMedicalCenters = async (req, res) => {
  try {
    const medicalCenters = await MedicalCenter.find()
      .sort({ createdAt: -1 })
      .populate("createdBy", "username email");
    return res.json({ medicalCenters });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Server error" });
  }
};

// Update medical center
const updateMedicalCenter = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      city,
      name,
      phoneNo,
      contactPerson,
      fax,
      email,
      location,
      address,
      isActive,
    } = req.body;

    const updatedMedicalCenter = await MedicalCenter.findByIdAndUpdate(
      id,
      {
        city,
        name,
        phoneNo,
        contactPerson,
        fax,
        email,
        location,
        address,
        isActive,
      },
      { new: true }
    );

    if (!updatedMedicalCenter) {
      return res.status(404).json({ message: "Medical Center not found" });
    }

    return res.json({
      message: "Medical Center updated successfully",
      medicalCenter: updatedMedicalCenter,
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Server error" });
  }
};

// Delete medical center
const deleteMedicalCenter = async (req, res) => {
  try {
    const { id } = req.params;
    const medicalCenter = await MedicalCenter.findById(id);

    if (!medicalCenter) {
      return res.status(404).json({ message: "Medical Center not found" });
    }

    await MedicalCenter.findByIdAndDelete(id);
    return res.json({ message: "Medical Center deleted successfully" });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Server error" });
  }
};

// Toggle active status
const toggleMedicalCenterStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const medicalCenter = await MedicalCenter.findById(id);

    if (!medicalCenter) {
      return res.status(404).json({ message: "Medical Center not found" });
    }

    medicalCenter.isActive = !medicalCenter.isActive;
    await medicalCenter.save();

    return res.json({
      message: `Medical Center ${
        medicalCenter.isActive ? "activated" : "deactivated"
      } successfully`,
      medicalCenter,
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Server error" });
  }
};

module.exports = {
  createMedicalCenter,
  listMedicalCenters,
  updateMedicalCenter,
  deleteMedicalCenter,
  toggleMedicalCenterStatus,
};
