const Company = require("../models/companyModel");
const path = require("path");
const fs = require("fs");

const { createLog } = require("./activityLogController");

// Create company
const createCompany = async (req, res) => {
  try {
    const { name, email, phone, address } = req.body;

    // Handle logo upload
    let logo = null;
    if (req.file) {
      logo = req.file.path;
    }

    const company = await Company.create({
      name,
      email,
      phone,
      address,
      logo,
      createdBy: req.user._id,
    });

    // Log activity
    await createLog({
      action: "created",
      entityType: "Company",
      entityId: company._id,
      entityName: company.name || company._id,
      description: `New company ${
        company.name || company._id
      } has been created by ${req.user?.username || "System"}`,
      performedBy: req.user?.username || "System",
      performedById: req.user?._id,
      meta: {},
    });

    return res.status(201).json({
      message: "Company created successfully",
      company,
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Server error" });
  }
};

// List companies
const listCompanies = async (req, res) => {
  try {
    const companies = await Company.find()
      .sort({ createdAt: -1 })
      .populate("createdBy", "username email");
    return res.json({ companies });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Server error" });
  }
};

// Update company
const updateCompany = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, email, phone, address } = req.body;

    // Handle logo upload
    let logo = null;
    if (req.file) {
      logo = req.file.path;
    }

    const updateData = {
      name,
      email,
      phone,
      address,
    };

    if (logo) {
      updateData.logo = logo;
    }

    const updatedCompany = await Company.findByIdAndUpdate(id, updateData, {
      new: true,
    });

    if (!updatedCompany) {
      return res.status(404).json({ message: "Company not found" });
    }

    // Log activity
    await createLog({
      action: "updated",
      entityType: "Company",
      entityId: updatedCompany._id,
      entityName: updatedCompany.name || updatedCompany._id,
      description: `Company ${
        updatedCompany.name || updatedCompany._id
      } has been updated by ${req.user?.username || "System"}`,
      performedBy: req.user?.username || "System",
      performedById: req.user?._id,
      meta: {},
    });

    return res.json({
      message: "Company updated successfully",
      company: updatedCompany,
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Server error" });
  }
};

// Delete company
const deleteCompany = async (req, res) => {
  try {
    const { id } = req.params;
    const company = await Company.findById(id);

    if (!company) {
      return res.status(404).json({ message: "Company not found" });
    }

    // Delete associated logo
    if (company.logo) {
      const fullPath = path.join(__dirname, "..", company.logo);
      if (fs.existsSync(fullPath)) {
        fs.unlinkSync(fullPath);
      }
    }

    const deleted = await Company.findByIdAndDelete(id);

    // Log activity
    await createLog({
      action: "deleted",
      entityType: "Company",
      entityId: deleted?._id,
      entityName: deleted?.name || deleted?._id,
      description: `The Company ${
        deleted?.name || deleted?._id
      } has been deleted by ${req.user?.username || "System"}`,
      performedBy: req.user?.username || "System",
      performedById: req.user?._id,
      meta: {},
    });

    return res.json({ message: "Company deleted successfully" });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Server error" });
  }
};

module.exports = {
  createCompany,
  listCompanies,
  updateCompany,
  deleteCompany,
};