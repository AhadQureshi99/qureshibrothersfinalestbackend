const Employer = require("../models/employerModel");
const bcrypt = require("bcryptjs");

// Get all employers
const getEmployers = async (req, res) => {
  try {
    const employers = await Employer.find().select("-password");
    res.status(200).json({ employers });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error fetching employers", error: error.message });
  }
};

// Get single employer
const getEmployer = async (req, res) => {
  try {
    const employer = await Employer.findById(req.params.id).select("-password");
    if (!employer) {
      return res.status(404).json({ message: "Employer not found" });
    }
    res.status(200).json({ employer });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error fetching employer", error: error.message });
  }
};

// Create employer
const createEmployer = async (req, res) => {
  try {
    const {
      code,
      username,
      companyName,
      city,
      state,
      country,
      password,
      ownership,
      sector,
      salesTurnover,
      numberOfEmployees,
      numberOfOffices,
      companyInfo,
      companyAddress,
      zip,
      street,
      fax,
      website,
      plan,
      phone,
      type,
      email,
      contactPersonName,
      contactPersonPhone,
      files,
    } = req.body;

    // Check if employer with code or email already exists
    const existingEmployer = await Employer.findOne({
      $or: [{ code }, { email }],
    });
    if (existingEmployer) {
      return res
        .status(400)
        .json({ message: "Employer with this code or email already exists" });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    const employer = new Employer({
      code,
      username,
      companyName,
      city,
      state,
      country,
      password: hashedPassword,
      ownership,
      sector,
      salesTurnover,
      numberOfEmployees,
      numberOfOffices,
      companyInfo,
      companyAddress,
      zip,
      street,
      fax,
      website,
      plan,
      phone,
      type,
      email,
      contactPersonName,
      contactPersonPhone,
      files,
    });

    await employer.save();
    res.status(201).json({
      message: "Employer created successfully",
      employer: employer.toObject({ getters: true }),
    });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error creating employer", error: error.message });
  }
};

// Update employer
const updateEmployer = async (req, res) => {
  try {
    const {
      code,
      username,
      companyName,
      city,
      state,
      country,
      password,
      ownership,
      sector,
      salesTurnover,
      numberOfEmployees,
      numberOfOffices,
      companyInfo,
      companyAddress,
      zip,
      street,
      fax,
      website,
      plan,
      phone,
      type,
      email,
      contactPersonName,
      contactPersonPhone,
      files,
    } = req.body;

    const employer = await Employer.findById(req.params.id);
    if (!employer) {
      return res.status(404).json({ message: "Employer not found" });
    }

    // Check if code or email conflicts with other employers
    const existingEmployer = await Employer.findOne({
      $or: [{ code }, { email }],
      _id: { $ne: req.params.id },
    });
    if (existingEmployer) {
      return res
        .status(400)
        .json({ message: "Employer with this code or email already exists" });
    }

    // Update fields
    employer.code = code;
    employer.username = username;
    employer.companyName = companyName;
    employer.city = city;
    employer.state = state;
    employer.country = country;
    if (password) {
      employer.password = await bcrypt.hash(password, 10);
    }
    employer.ownership = ownership;
    employer.sector = sector;
    employer.salesTurnover = salesTurnover;
    employer.numberOfEmployees = numberOfEmployees;
    employer.numberOfOffices = numberOfOffices;
    employer.companyInfo = companyInfo;
    employer.companyAddress = companyAddress;
    employer.zip = zip;
    employer.street = street;
    employer.fax = fax;
    employer.website = website;
    employer.plan = plan;
    employer.phone = phone;
    employer.type = type;
    employer.email = email;
    employer.contactPersonName = contactPersonName;
    employer.contactPersonPhone = contactPersonPhone;
    employer.files = files;

    await employer.save();
    res.status(200).json({
      message: "Employer updated successfully",
      employer: employer.toObject({ getters: true }),
    });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error updating employer", error: error.message });
  }
};

// Delete employer
const deleteEmployer = async (req, res) => {
  try {
    const employer = await Employer.findByIdAndDelete(req.params.id);
    if (!employer) {
      return res.status(404).json({ message: "Employer not found" });
    }
    res.status(200).json({ message: "Employer deleted successfully" });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error deleting employer", error: error.message });
  }
};

// Get security fee refund candidates
const getSecurityFeeRefundCandidates = async (req, res) => {
  try {
    // This would typically involve joining with job applications and candidate data
    // For now, returning a mock response structure
    const candidates = [
      {
        _id: "1",
        jobTitle: "Software Engineer",
        salary: 50000,
        companyName: "Tech Corp",
        contactPerson: "John Doe",
        candidateName: "Jane Smith",
        mobile: "1234567890",
        applicationDate: "2024-01-15",
        status: "Applied",
      },
      // Add more mock data as needed
    ];
    res.status(200).json({ candidates });
  } catch (error) {
    console.error("Error in getSecurityFeeRefundCandidates:", error);
    res.status(500).json({
      message: "Error fetching security fee refund candidates",
      error: error.message,
    });
  }
};

module.exports = {
  getEmployers,
  getEmployer,
  createEmployer,
  updateEmployer,
  deleteEmployer,
};
