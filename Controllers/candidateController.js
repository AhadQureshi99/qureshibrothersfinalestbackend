const Candidate = require("../models/candidateModel");
const { createLog } = require("./activityLogController");
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
      date: body.date,
      name: body.name,
      fatherName: body.fatherName,
      dateOfBirth: body.dateOfBirth,
      age: body.age,
      placeOfBirth: body.placeOfBirth,
      email: body.email,
      contact: body.mobile,
      passportIssueDate: body.passportIssueDate,
      passport: body.passport,
      passportExpiryDate: body.passportExpiryDate,
      maritalStatus: body.maritalStatus,
      companyNameEnglish: body.companyNameEnglish,
      companyNameArabic: body.companyNameArabic,
      tradeEnglish: body.tradeEnglish,
      tradeArabic: body.tradeArabic,
      visaId: body.visaId,
      visaNo: body.visaNo,
      eNo: body.eNo,
      salary: body.salary,
      profession: body.profession,
      address: body.address,
      experience: body.experience,
      status: body.status || "Initial Registration",
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
    // Log activity
    // Try to get the user who created the candidate
    let performedBy = "System";
    let performedById = undefined;
    if (req.user) {
      performedBy =
        req.user.username ||
        req.user.email ||
        req.user._id?.toString() ||
        "Unknown";
      performedById = req.user._id;
    }
    // Try to get the candidate name from the saved candidate (fallback to body.name)
    const candidateName = candidate.name || body.name || "(no name)";
    await createLog({
      action: "created",
      entityType: "Candidate",
      entityId: candidate._id,
      entityName: candidateName,
      description: `New candidate ${candidateName} has been created by ${performedBy}`,
      performedBy,
      performedById,
      meta: {},
    });
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

// Handler: update candidate
const updateCandidate = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    const candidate = await Candidate.findByIdAndUpdate(id, updateData, {
      new: true,
      runValidators: true,
    });

    if (!candidate) {
      return res.status(404).json({ message: "Candidate not found" });
    }

    // Log activity
    await createLog({
      action: "updated",
      entityType: "Candidate",
      entityId: candidate._id,
      entityName: candidate.name,
      description: `Candidate ${candidate.name} has been updated by ${
        req.user?.username || "System"
      }`,
      performedBy: req.user?.username || "System",
      performedById: req.user?._id,
      meta: {},
    });
    res
      .status(200)
      .json({ message: "Candidate updated successfully", candidate });
  } catch (err) {
    console.error("updateCandidate error", err);
    res.status(500).json({ message: err.message });
  }
};

// Upload/replace profile picture for existing candidate
const uploadProfilePicture = async (req, res) => {
  try {
    const id = req.params.id;
    if (!req.file) return res.status(400).json({ message: "No file uploaded" });

    const baseUrl =
      process.env.API_URL || `http://localhost:${process.env.PORT || 3001}`;

    const url = `${baseUrl}/Uploads/candidates/${req.file.filename}`;
    const candidate = await Candidate.findByIdAndUpdate(
      id,
      { profilePicture: url },
      { new: true }
    );

    if (!candidate)
      return res.status(404).json({ message: "Candidate not found" });

    res.status(200).json({ message: "Profile picture uploaded", candidate });
  } catch (err) {
    console.error("uploadProfilePicture error", err);
    res.status(500).json({ message: err.message });
  }
};

// Handler: delete candidate (also clean up uploaded files if present)
const deleteCandidate = async (req, res) => {
  try {
    const id = req.params.id;
    const candidate = await Candidate.findById(id);
    if (!candidate)
      return res.status(404).json({ message: "Candidate not found" });

    // remove profile picture file if it points to Uploads/candidates
    try {
      if (candidate.profilePicture) {
        const fname = path.basename(candidate.profilePicture);
        const filePath = path.join(uploadDir, fname);
        if (fs.existsSync(filePath)) {
          fs.unlinkSync(filePath);
        }
      }

      // remove document files if present
      if (Array.isArray(candidate.documents)) {
        for (const doc of candidate.documents) {
          if (doc && doc.filename) {
            const dpath = path.join(uploadDir, doc.filename);
            if (fs.existsSync(dpath)) {
              fs.unlinkSync(dpath);
            }
          }
        }
      }
    } catch (fileErr) {
      // don't block deletion if cleanup fails; just log
      console.warn(
        "Failed to remove uploaded files for candidate",
        id,
        fileErr
      );
    }

    await Candidate.findByIdAndDelete(id);
    // Log activity
    await createLog({
      action: "deleted",
      entityType: "Candidate",
      entityId: candidate._id,
      entityName: candidate.name,
      description: `Candidate ${candidate.name} has been deleted by ${
        req.user?.username || "System"
      }`,
      performedBy: req.user?.username || "System",
      performedById: req.user?._id,
      meta: {},
    });
    res.status(200).json({ message: "Candidate deleted" });
  } catch (err) {
    console.error("deleteCandidate error", err);
    res.status(500).json({ message: err.message });
  }
};

module.exports = {
  upload,
  createCandidate,
  getCandidates,
  getCandidateById,
  updateCandidate,
  uploadProfilePicture,
  deleteCandidate,
};
