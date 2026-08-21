const Company = require("../models/companyModel");
const Job = require("../models/jobModel");
const JobCategory = require("../models/jobCategoryModel");
const Candidate = require("../models/candidateModel");
const path = require("path");
const fs = require("fs");

const { createLog } = require("./activityLogController");

// Create company
const createCompany = async (req, res) => {
  try {
    const { name, email, phone, address, password } = req.body;

    if (!password) {
      return res.status(400).json({
        message: "Password is required so the company can log in to the portal",
      });
    }

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
      password,
      logo,
      createdBy: req.user._id,
    });

    // Return company without the password hash
    const companyDoc = company.toObject();
    delete companyDoc.password;

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
      company: companyDoc,
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
    const { name, email, phone, address, password } = req.body;

    // Handle logo upload
    let logo = null;
    if (req.file) {
      logo = req.file.path;
    }

    // Fetch company and update fields (use save() so pre-save hooks run for password)
    const company = await Company.findById(id);
    if (!company) {
      return res.status(404).json({ message: "Company not found" });
    }

    company.name = name || company.name;
    company.email = email || company.email;
    company.phone = phone || company.phone;
    company.address = address || company.address;
    if (logo) company.logo = logo;
    if (password) company.password = password; // will be hashed by pre-save

    const updatedCompany = await company.save();

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

// Company login
const loginCompany = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res
        .status(400)
        .json({ message: "Email and password are required" });
    }

    const company = await Company.findOne({
      email: email.toLowerCase(),
    }).select("+password");
    if (!company) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const valid = await company.isPasswordCorrect(password);
    if (!valid) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const token = company.generateAccessToken();
    const companyObj = company.toObject();
    delete companyObj.password;

    return res.json({
      message: "Login successful",
      token,
      company: companyObj,
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Server error" });
  }
};

// Company dashboard - jobs and their applicants
const companyDashboard = async (req, res) => {
  try {
    const authHeader = req.headers.authorization || req.headers.Authorization;
    if (!authHeader?.startsWith("Bearer ")) {
      return res.status(401).json({ message: "Unauthorized" });
    }
    const token = authHeader.split(" ")[1];
    const decoded = require("jsonwebtoken").verify(
      token,
      process.env.JWT_SECRET,
    );
    const company = await Company.findById(decoded.id);
    if (!company) return res.status(401).json({ message: "Unauthorized" });

    const normalize = (s = "") =>
      String(s || "")
        .trim()
        .toLowerCase();
    const escapeRegex = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

    // Jobs are created through the "Add Job Category" page as JobCategory
    // documents (with an embedded jobs[] array). They may also exist as
    // standalone Job documents (created from the Job Setup page). Load both.
    const jobCategories = await JobCategory.find({
      companyId: company._id,
    })
      .sort({ createdAt: -1 })
      .lean();
    const standaloneJobs = await Job.find({ companyId: company._id })
      .sort({ createdAt: -1 })
      .lean();

    const titleMatch = (field, value) => ({
      [field]: {
        $regex: new RegExp("^" + escapeRegex(normalize(value)) + "$", "i"),
      },
    });

    const findCandidates = (jobTitle) =>
      Candidate.find({
        $or: [
          titleMatch("jobAppliedFor", jobTitle),
          titleMatch("jobType", jobTitle),
          titleMatch("companyNameEnglish", company.name),
        ],
      }).select(
        "name firstName lastName email mobile phone status currentStatus cnic jobAppliedFor jobType",
      );

    const jobs = [];

    // Jobs stored inside JobCategory documents
    for (const cat of jobCategories) {
      for (const job of cat.jobs || []) {
        const candidates = await findCandidates(job.jobTitle);
        jobs.push({
          job: {
            _id: job._id ? String(job._id) : `${cat._id}-${job.jobTitle}`,
            jobTitle: job.jobTitle,
            jobTitleForDisplay: job.jobTitle,
            location: job.location,
            education: job.education,
            noOfPerson: job.noOfPerson,
            description: job.description,
          },
          candidates,
        });
      }
    }

    // Standalone Job documents
    for (const job of standaloneJobs) {
      const candidates = await findCandidates(job.jobTitle);
      jobs.push({
        job: {
          _id: String(job._id),
          jobTitle: job.jobTitle,
          jobTitleForDisplay: job.jobTitleForDisplay || job.jobTitle,
          jobNo: job.jobNo,
          categories: job.categories,
          salaryAmount: job.salaryAmount,
          salary: job.salary,
        },
        candidates,
      });
    }

    return res.json({
      company: {
        _id: company._id,
        name: company.name,
        email: company.email,
        phone: company.phone,
        address: company.address,
      },
      jobs,
    });
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
  loginCompany,
  companyDashboard,
};
