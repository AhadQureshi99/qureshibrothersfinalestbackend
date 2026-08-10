const VisaIssuingAuthority = require("../models/visaIssuingAuthorityModel");

// Create visa issuing authority
const createVisaIssuingAuthority = async (req, res) => {
  try {
    const { name } = req.body;

    const visaIssuingAuthority = await VisaIssuingAuthority.create({
      name,
      createdBy: req.user._id,
    });

    return res.status(201).json({
      message: "Visa Issuing Authority created successfully",
      visaIssuingAuthority,
    });
  } catch (err) {
    console.error(err);
    if (err.code === 11000) {
      return res
        .status(400)
        .json({ message: "Visa Issuing Authority name already exists" });
    }
    return res.status(500).json({ message: "Server error" });
  }
};

// List visa issuing authorities
const listVisaIssuingAuthorities = async (req, res) => {
  try {
    const visaIssuingAuthorities = await VisaIssuingAuthority.find()
      .sort({ createdAt: -1 })
      .populate("createdBy", "username email");
    return res.json({ authorities: visaIssuingAuthorities });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Server error" });
  }
};

// Update visa issuing authority
const updateVisaIssuingAuthority = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, isActive } = req.body;

    const updatedAuthority = await VisaIssuingAuthority.findByIdAndUpdate(
      id,
      { name, isActive },
      { new: true }
    );

    if (!updatedAuthority) {
      return res
        .status(404)
        .json({ message: "Visa Issuing Authority not found" });
    }

    return res.json({
      message: "Visa Issuing Authority updated successfully",
      visaIssuingAuthority: updatedAuthority,
    });
  } catch (err) {
    console.error(err);
    if (err.code === 11000) {
      return res
        .status(400)
        .json({ message: "Visa Issuing Authority name already exists" });
    }
    return res.status(500).json({ message: "Server error" });
  }
};

// Delete visa issuing authority
const deleteVisaIssuingAuthority = async (req, res) => {
  try {
    const { id } = req.params;
    const authority = await VisaIssuingAuthority.findById(id);

    if (!authority) {
      return res
        .status(404)
        .json({ message: "Visa Issuing Authority not found" });
    }

    await VisaIssuingAuthority.findByIdAndDelete(id);
    return res.json({ message: "Visa Issuing Authority deleted successfully" });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Server error" });
  }
};

// Toggle active status
const toggleVisaIssuingAuthorityStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const authority = await VisaIssuingAuthority.findById(id);

    if (!authority) {
      return res
        .status(404)
        .json({ message: "Visa Issuing Authority not found" });
    }

    authority.isActive = !authority.isActive;
    await authority.save();

    return res.json({
      message: `Visa Issuing Authority ${
        authority.isActive ? "activated" : "deactivated"
      } successfully`,
      visaIssuingAuthority: authority,
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Server error" });
  }
};

module.exports = {
  createVisaIssuingAuthority,
  listVisaIssuingAuthorities,
  updateVisaIssuingAuthority,
  deleteVisaIssuingAuthority,
  toggleVisaIssuingAuthorityStatus,
};
