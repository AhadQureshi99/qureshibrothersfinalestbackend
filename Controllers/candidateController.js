const Candidate = require("../models/candidateModel");
const multer = require("multer");
const path = require("path");
const fs = require("fs");

// Ensure Uploads directory exists for candidates
const uploadDir = path.join(__dirname, "../Uploads/candidates");
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// multer storage
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadDir),
  filename: (req, file, cb) => {
    const unique = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, `${unique}${path.extname(file.originalname)}`);
  },
});

const upload = multer({ storage, limits: { fileSize: 10 * 1024 * 1024 } });

// Handler: create candidate with files
const createCandidate = async (req, res) => {
  try {
    // fields come from form data
    const body = req.body || {};

    const candidate = new Candidate({
      name: body.name,
      fatherName: body.fatherName,
      gender: body.gender,
      age: body.age,
      dob: body.dob,
      profession: body.profession,
      qualification: body.qualification,
      placeOfBirth: body.placeOfBirth,
      cnic: body.cnic,
      passport: body.passport,
      ppIssue: body.ppIssue,
      ppExpiry: body.ppExpiry,
      address: body.address,
      city: body.city,
      state: body.state,
      country: body.country,
      contact: body.contact,
      maritalStatus: body.maritalStatus,
      salary: body.salary,
      status: body.status || "Applied",
      receiveDate: body.receiveDate || undefined,
    });

    const baseUrl =
      process.env.API_URL || `http://localhost:${process.env.PORT || 3001}`;

    // profilePicture: single file with field name 'profilePicture'
    if (
      req.files &&
      req.files["profilePicture"] &&
      req.files["profilePicture"][0]
    ) {
      const f = req.files["profilePicture"][0];
      candidate.profilePicture = `${baseUrl}/Uploads/candidates/${f.filename}`;
    }

    // documents: possibly multiple files under field 'documents'
    if (req.files && req.files["documents"]) {
      let meta = [];
      if (req.body.documentsMeta) {
        try {
          meta = JSON.parse(req.body.documentsMeta);
        } catch (e) {
          meta = [];
        }
      }
      candidate.documents = req.files["documents"].map((f, i) => {
        const m = meta[i] || {};
        return {
          title: m.title || f.originalname,
          url: `${baseUrl}/Uploads/candidates/${f.filename}`,
          filename: f.filename,
          done: typeof m.done === "boolean" ? m.done : false,
          passed: typeof m.passed === "boolean" ? m.passed : false,
        };
      });
    }

    await candidate.save();
    res.status(201).json({ message: "Candidate created", candidate });
  } catch (err) {
    console.error("createCandidate error", err);
    res.status(500).json({ message: err.message });
  }
};

// Handler: get all candidates
const getCandidates = async (req, res) => {
  try {
    const candidates = await Candidate.find({});
    res.status(200).json(candidates);
  } catch (err) {
    console.error("getCandidates error", err);
    res.status(500).json({ message: err.message });
  }
};

// Handler: get single candidate by ID
const getCandidateById = async (req, res) => {
  try {
    const candidate = await Candidate.findById(req.params.id);
    if (!candidate) {
      return res.status(404).json({ message: "Candidate not found" });
    }
    res.status(200).json(candidate);
  } catch (err) {
    console.error("getCandidateById error", err);
    res.status(500).json({ message: err.message });
  }
};

module.exports = { upload, createCandidate, getCandidates, getCandidateById };
