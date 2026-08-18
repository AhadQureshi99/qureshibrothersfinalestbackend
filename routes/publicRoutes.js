const express = require("express");
const Candidate = require("../models/candidateModel");
const JobCategory = require("../models/jobCategoryModel");
const EducationCategory = require("../models/educationCategoryModel");
const {
  getCountriesAndNationalities,
} = require("../Controllers/countryReferenceController");
const { upload } = require("../Controllers/candidateController");
const { createLog } = require("../Controllers/activityLogController");
const jwt = require("jsonwebtoken");

const router = express.Router();

// This endpoint exposes only the job titles needed by the public registration form.
router.get("/job-categories", async (req, res) => {
  try {
    const categories = await JobCategory.find({ isActive: { $ne: false } })
      .sort({ createdAt: -1 })
      .select("_id name jobs");
    res.json({ categories });
  } catch (error) {
    console.error("Public job categories error", error);
    res.status(500).json({ message: "Unable to load job types" });
  }
});

router.get("/education-categories", async (req, res) => {
  try {
    const categories = await EducationCategory.find({
      isActive: { $ne: false },
    })
      .sort({ name: 1 })
      .select("_id name");
    res.json({ categories });
  } catch (error) {
    console.error("Public education categories error", error);
    res.status(500).json({ message: "Unable to load education options" });
  }
});

router.get("/countries", getCountriesAndNationalities);

// Public website equivalent of Initial Registration. Only its seven allowed fields
// are accepted, so public callers cannot set internal candidate data or statuses.
router.post("/candidates/initial-registration", async (req, res) => {
  try {
    const {
      firstName,
      lastName,
      email = "",
      mobile = "",
      experience = "",
      profession,
      address = "",
    } = req.body || {};
    const cleanedFirstName = String(firstName || "").trim();
    const cleanedLastName = String(lastName || "").trim();
    const cleanedProfession = String(profession || "").trim();
    const cleanedMobile = String(mobile || "")
      .replace(/\D/g, "")
      .slice(0, 11);

    if (!cleanedFirstName || !cleanedLastName || !cleanedProfession) {
      return res
        .status(400)
        .json({ message: "First name, last name, and job type are required." });
    }
    if (email && !/^\S+@\S+\.\S+$/.test(email)) {
      return res
        .status(400)
        .json({ message: "Please enter a valid email address." });
    }

    const candidate = await Candidate.create({
      firstName: cleanedFirstName,
      lastName: cleanedLastName,
      name: `${cleanedFirstName} ${cleanedLastName}`,
      email: String(email).trim(),
      mobile: cleanedMobile,
      profession: cleanedProfession,
      // The public "Job Type" dropdown posts under `profession`; mirror it into
      // jobType / jobAppliedFor so the candidate shows up on company dashboards.
      jobType: cleanedProfession,
      jobAppliedFor: cleanedProfession,
      experience: String(experience).trim(),
      address: String(address).trim(),
      status: "Initial Registration",
    });

    await createLog({
      action: "created",
      entityType: "Candidate",
      entityId: candidate._id,
      entityName: candidate.name,
      description: `New candidate ${candidate.name} registered from the public website`,
      performedBy: "Public Website",
      meta: { source: "public-website" },
    });

    const continuationToken = jwt.sign(
      {
        candidateId: candidate._id.toString(),
        purpose: "public-final-registration",
      },
      process.env.JWT_SECRET,
      { expiresIn: "7d" },
    );
    res.status(201).json({
      message: "Candidate registered successfully",
      continuationToken,
    });
  } catch (error) {
    console.error("Public candidate registration error", error);
    res.status(500).json({
      message: "Unable to submit your registration. Please try again.",
    });
  }
});

const getContinuationCandidate = async (req, res, next) => {
  try {
    const token =
      req.headers.authorization?.replace("Bearer ", "") || req.query.token;
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    if (decoded.purpose !== "public-final-registration")
      throw new Error("Invalid token");
    req.continuationCandidateId = decoded.candidateId;
    next();
  } catch {
    res
      .status(401)
      .json({ message: "This registration link is invalid or has expired." });
  }
};

router.get(
  "/candidates/final-registration",
  getContinuationCandidate,
  async (req, res) => {
    const candidate = await Candidate.findById(
      req.continuationCandidateId,
    ).select("firstName lastName email mobile experience profession address");
    if (!candidate)
      return res.status(404).json({ message: "Candidate not found." });
    res.json({ candidate });
  },
);

const publicCandidateFiles = upload.fields([
  { name: "profilePicture", maxCount: 1 },
  { name: "documents", maxCount: 30 },
]);

router.put(
  "/candidates/final-registration",
  getContinuationCandidate,
  publicCandidateFiles,
  async (req, res) => {
    try {
      const allowed = [
        "cnic",
        "fatherName",
        "gender",
        "dateOfBirth",
        "age",
        "placeOfBirth",
        "nationality",
        "religion",
        "wages",
        "maritalStatus",
        "education",
        "profession",
        "experience",
        "jobType",
        "jobAppliedFor",
        "plan",
        "passportNumber",
        "passportIssueDate",
        "passportExpiryDate",
        "passportIssuePlace",
        "country",
        "state",
        "province",
        "zip",
        "district",
        "city",
        "street",
        "phone",
        "mobile",
        "email",
        "address",
        "contactAddress",
        "returnAddress",
        "emergencyContact",
        "emergencyContactRelation",
        "currentStatus",
        "statusDate",
        "convicted",
        "politicalAffiliation",
        "presentEmployment",
        "achievements",
      ];
      const update = Object.fromEntries(
        allowed
          .filter((key) => key in req.body)
          .map((key) => [key, req.body[key]]),
      );
      for (const key of ["skills", "dependents", "educations"]) {
        if (req.body[key] !== undefined) {
          try {
            update[key] = JSON.parse(req.body[key]);
          } catch {
            update[key] = [];
          }
        }
      }
      const baseUrl =
        process.env.API_URL || `http://localhost:${process.env.PORT || 3001}`;
      if (req.files?.profilePicture?.[0])
        update.profilePicture = `${baseUrl}/Uploads/candidates/${req.files.profilePicture[0].filename}`;
      if (req.files?.documents?.length)
        update.resumes = req.files.documents.map((file) => ({
          filename: file.originalname,
          url: `${baseUrl}/Uploads/candidates/${file.filename}`,
        }));
      update.name =
        `${req.body.firstName || ""} ${req.body.lastName || ""}`.trim() ||
        undefined;
      update.status = "Final Registration";
      const candidate = await Candidate.findByIdAndUpdate(
        req.continuationCandidateId,
        update,
        { new: true, runValidators: true },
      );
      if (!candidate)
        return res.status(404).json({ message: "Candidate not found." });
      res.json({
        message: "Your final registration has been submitted successfully.",
      });
    } catch (error) {
      console.error("Public final registration error", error);
      res
        .status(500)
        .json({ message: "Unable to save your final registration." });
    }
  },
);

module.exports = router;
