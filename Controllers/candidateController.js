const Candidate = require("../models/candidateModel");
const { createLog } = require("./activityLogController");
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const nodemailer = require("nodemailer");

// Configure nodemailer transporter (same Gmail setup as userController)
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

// Send interview schedule notification email to candidate
const sendInterviewNotificationEmail = async (candidate) => {
  if (!candidate || !candidate.email) return;

  const interviewDate = candidate.interviewDate
    ? new Date(candidate.interviewDate).toLocaleDateString("en-GB", {
        weekday: "long",
        year: "numeric",
        month: "long",
        day: "numeric",
      })
    : "Not specified";
  const interviewTime = candidate.interviewTime || "Not specified";
  const interviewLocation = candidate.interviewLocation || "Not specified";
  const interviewNotes = candidate.interviewNotes || "—";
  const candidateName =
    candidate.name ||
    [candidate.firstName, candidate.lastName].filter(Boolean).join(" ") ||
    "Candidate";

  await transporter.sendMail({
    from: `"QureshiBrothers" <${process.env.EMAIL_USER}>`,
    to: candidate.email,
    subject: "Interview Scheduled - QureshiBrothers",
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; background-color: #f4f4f4; margin: 0; padding: 0; }
          .container { max-width: 600px; margin: 20px auto; background-color: #ffffff; padding: 0; border-radius: 8px; box-shadow: 0 0 10px rgba(0,0,0,0.1); overflow: hidden; }
          .header { background: linear-gradient(135deg, #1b5e20 0%, #2e7d32 100%); color: #ffffff; padding: 24px; text-align: center; }
          .header h1 { margin: 0; font-size: 24px; }
          .content { padding: 24px; line-height: 1.6; color: #333333; }
          .details { background-color: #f9f9f9; border: 1px solid #e0e0e0; border-radius: 8px; padding: 16px; margin: 20px 0; }
          .details p { margin: 8px 0; }
          .label { font-weight: bold; color: #2e7d32; }
          .footer { text-align: center; padding: 16px; color: #666666; font-size: 12px; border-top: 1px solid #e0e0e0; background-color: #fafafa; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Interview Scheduled</h1>
            <p style="margin: 8px 0 0; font-size: 14px;">QureshiBrothers</p>
          </div>
          <div class="content">
            <p>Dear <strong>${candidateName}</strong>,</p>
            <p>Congratulations! Your interview has been scheduled. Please find the details below:</p>
            <div class="details">
              <p><span class="label">Date:</span> ${interviewDate}</p>
              <p><span class="label">Time:</span> ${interviewTime}</p>
              <p><span class="label">Location:</span> ${interviewLocation}</p>
              <p><span class="label">Notes:</span> ${interviewNotes}</p>
            </div>
            <p>Please arrive 15 minutes early and bring your original CNIC and any relevant documents.</p>
            <p>If you have any questions, please contact our support team.</p>
            <p>Best regards,<br/>QureshiBrothers Team</p>
          </div>
          <div class="footer">
            <p>&copy; ${new Date().getFullYear()} QureshiBrothers. All rights reserved.</p>
          </div>
        </div>
      </body>
      </html>
    `,
  });
};

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

const parseJsonField = (value, fallback = []) => {
  if (typeof value !== "string") return value || fallback;
  try {
    return JSON.parse(value);
  } catch {
    return fallback;
  }
};

// Handler: create candidate with files
const createCandidate = async (req, res) => {
  try {
    // fields come from form data
    const body = req.body || {};

    // Create candidate with ALL available fields from body
    const candidate = new Candidate({
      // Basic Info Fields
      date: body.date,
      name: body.name,
      username: body.username,
      password: body.password,
      candidateType: body.candidateType,
      title: body.title,
      firstName: body.firstName,
      lastName: body.lastName,
      cnic: body.cnic,
      fatherName: body.fatherName,
      gender: body.gender,
      dateOfBirth: body.dateOfBirth,
      age: body.age,
      placeOfBirth: body.placeOfBirth,
      nationality: body.nationality,
      maritalStatus: body.maritalStatus,
      education: body.education,
      profession: body.profession,
      experience: body.experience,
      jobType: body.jobType,
      jobAppliedFor: body.jobAppliedFor,
      plan: body.plan,
      religion: body.religion,
      wages: body.wages,
      address: body.address,

      // Passport Info Fields
      passportNumber: body.passportNumber,
      passportIssueDate: body.passportIssueDate,
      passportExpiryDate: body.passportExpiryDate,
      passportIssuePlace: body.passportIssuePlace,

      // Residence Info Fields
      country: body.country,
      state: body.state,
      province: body.province,
      zip: body.zip,
      district: body.district,
      city: body.city,
      street: body.street,

      // Contact Details Fields
      phone: body.phone,
      mobile: body.mobile,
      email: body.email,
      fax: body.fax,
      website: body.website,
      contactAddress: body.contactAddress,
      returnAddress: body.returnAddress,
      emergencyContact: body.emergencyContact,
      emergencyContactRelation: body.emergencyContactRelation,

      // Skills Array
      skills: parseJsonField(body.skills),

      // Present Status Fields
      currentStatus: body.currentStatus,
      statusDate: body.statusDate,
      convicted: body.convicted,
      politicalAffiliation: body.politicalAffiliation,
      presentEmployment: body.presentEmployment,
      achievements: body.achievements,

      // Dependents Array
      dependents: parseJsonField(body.dependents),

      // Resumes Array
      resumes: parseJsonField(body.resumes),

      // Legacy fields for backward compatibility
      contact: body.contact || body.mobile,
      passport: body.passport || body.passportNumber,
      ppIssue: body.ppIssue || body.passportIssueDate,
      ppExpiry: body.ppExpiry || body.passportExpiryDate,
      salary: body.salary || body.wages,
      companyNameEnglish: body.companyNameEnglish,
      companyNameArabic: body.companyNameArabic,
      tradeEnglish: body.tradeEnglish,
      tradeArabic: body.tradeArabic,
      visaId: body.visaId,
      visaNo: body.visaNo,
      eNo: body.eNo,

      // Status
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
      candidate.resumes = req.files["documents"].map((f) => ({
        filename: f.originalname,
        url: baseUrl + "/Uploads/candidates/" + f.filename,
      }));
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
    // Try to get the candidate name from the saved candidate or common fields
    let candidateName =
      candidate.name || body.name || body.fullName || body.candidateName;
    if (!candidateName && body.firstName && body.lastName) {
      candidateName = `${body.firstName} ${body.lastName}`;
    }
    if (!candidateName) {
      candidateName = "(no name)";
    }
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
    const body = req.body || {};
    console.log("UPDATE BODY KEYS", Object.keys(body));
    console.log("UPDATE BODY FEE FIELDS", {
      nestedTotal: body["stage2[totalFee]"],
      nestedDeposited: body["stage2[depositedFee]"],
      flatTotal: body.totalFee,
      flatDeposited: body.depositedFee,
      flatFeeDone: body.feeDone,
    });

    // Helper to read bracket-nested form fields like stage2[totalFee]
    const getNested = (prefix, key) => {
      const val = body[`${prefix}[${key}]`];
      return val === undefined ? null : val;
    };

    const getField = (...keys) => {
      for (const key of keys) {
        if (body[key] !== undefined && body[key] !== null && body[key] !== "") {
          return body[key];
        }
      }
      return null;
    };

    // Build documentDetails array from stage4 document flags/dates
    const documentDetails = [];
    Object.keys(body).forEach((k) => {
      const match = k.match(/^stage4\[([a-zA-Z]+)\]$/);
      if (match) {
        const name = match[1];
        const checked = body[k] === "true";
        const date = getNested("stage4", `${name}Date`) || "";
        documentDetails.push({ name, checked, date });
      }
    });

    let updateData = {
      ...body,
      ...(body.skills !== undefined
        ? { skills: parseJsonField(body.skills) }
        : {}),
      ...(body.dependents !== undefined
        ? { dependents: parseJsonField(body.dependents) }
        : {}),
      ...(body.educations !== undefined
        ? { educations: parseJsonField(body.educations) }
        : {}),
      ...(body.resumes !== undefined
        ? { resumes: parseJsonField(body.resumes) }
        : {}),
      // Document Upload stage fields
      ...(getField("stage2[totalFee]", "totalFee", "stage2.totalFee") !== null
        ? {
            totalFee: getField(
              "stage2[totalFee]",
              "totalFee",
              "stage2.totalFee",
            ),
          }
        : {}),
      ...(getField(
        "stage2[depositedFee]",
        "depositedFee",
        "stage2.depositedFee",
      ) !== null
        ? {
            depositedFee: getField(
              "stage2[depositedFee]",
              "depositedFee",
              "stage2.depositedFee",
            ),
          }
        : {}),
      ...(getField("stage2[feeDone]", "feeDone", "stage2.feeDone") !== null
        ? {
            feeDone:
              String(
                getField("stage2[feeDone]", "feeDone", "stage2.feeDone"),
              ) === "true",
          }
        : {}),
      ...(getField("stage2[feeDate]", "feeDate", "stage2.feeDate") !== null
        ? { feeDate: getField("stage2[feeDate]", "feeDate", "stage2.feeDate") }
        : {}),
      ...(getNested("stage1", "navttcAppointmentDone") !== null
        ? {
            navttcAppointmentDone:
              getNested("stage1", "navttcAppointmentDone") === "true",
          }
        : {}),
      ...(getNested("stage1", "navttcAppointmentDate") !== null
        ? {
            navttcAppointmentDate: getNested("stage1", "navttcAppointmentDate"),
          }
        : {}),
      ...(getNested("stage1", "navttcTestDone") !== null
        ? { navttcTestDone: getNested("stage1", "navttcTestDone") === "true" }
        : {}),
      ...(getNested("stage1", "navttcDate") !== null
        ? { navttcDate: getNested("stage1", "navttcDate") }
        : {}),
      ...(getNested("stage1", "medicalAppointmentDone") !== null
        ? {
            medicalAppointmentDone:
              getNested("stage1", "medicalAppointmentDone") === "true",
          }
        : {}),
      ...(getNested("stage1", "medicalAppointmentDate") !== null
        ? {
            medicalAppointmentDate: getNested(
              "stage1",
              "medicalAppointmentDate",
            ),
          }
        : {}),
      ...(getNested("stage1", "medicalTestDone") !== null
        ? {
            medicalTestDone: getNested("stage1", "medicalTestDone") === "true",
          }
        : {}),
      ...(getNested("stage1", "medicalTestDate") !== null
        ? { medicalTestDate: getNested("stage1", "medicalTestDate") }
        : {}),
      ...(getNested("stage1", "pccDone") !== null
        ? { pccDone: getNested("stage1", "pccDone") === "true" }
        : {}),
      ...(getNested("stage1", "pccDate") !== null
        ? { pccDate: getNested("stage1", "pccDate") }
        : {}),
      ...(getNested("stage3", "eNoIssued") !== null
        ? { eNoIssued: getNested("stage3", "eNoIssued") === "true" }
        : {}),
      ...(getNested("stage3", "eNoDate") !== null
        ? { eNoDate: getNested("stage3", "eNoDate") }
        : {}),
      ...(getNested("stage5", "agencyLicense") !== null
        ? { agencyLicense: getNested("stage5", "agencyLicense") === "true" }
        : {}),
      ...(getNested("stage5", "agencyDate") !== null
        ? { agencyDate: getNested("stage5", "agencyDate") }
        : {}),
      ...(documentDetails.length > 0 ? { documentDetails } : {}),
    };

    const baseUrl =
      process.env.API_URL || `http://localhost:${process.env.PORT || 3001}`;
    const existingCandidate =
      await Candidate.findById(id).select("documents resumes");
    if (!existingCandidate) {
      return res.status(404).json({ message: "Candidate not found" });
    }
    if (req.files?.profilePicture?.[0]) {
      updateData.profilePicture =
        baseUrl + "/Uploads/candidates/" + req.files.profilePicture[0].filename;
    }
    if (req.files?.documents?.length) {
      const uploadedResumes = req.files.documents.map((file) => ({
        filename: file.originalname,
        url: baseUrl + "/Uploads/candidates/" + file.filename,
      }));
      updateData.resumes = [
        ...(existingCandidate.resumes || []),
        ...(updateData.resumes || []),
        ...uploadedResumes,
      ];

      // Also store documents with metadata titles (if provided)
      let docMeta = [];
      if (req.body.documentsMeta) {
        try {
          docMeta = JSON.parse(req.body.documentsMeta);
        } catch (e) {
          docMeta = [];
        }
      }
      const uploadedDocs = req.files.documents.map((file, i) => {
        const m = docMeta[i] || {};
        return {
          title: m.title || file.originalname,
          url: baseUrl + "/Uploads/candidates/" + file.filename,
          filename: file.originalname,
          done: typeof m.done === "boolean" ? m.done : false,
          passed: typeof m.passed === "boolean" ? m.passed : false,
        };
      });
      updateData.documents = [
        ...(existingCandidate.documents || []),
        ...(updateData.documents || []),
        ...uploadedDocs,
      ];
    }
    const previousCandidate =
      await Candidate.findById(id).select("name status");

    // If multipart/form-data, status may be a string, so ensure it's set
    if (req.body.status) {
      updateData.status = req.body.status;
    }

    // If files are uploaded, handle them here (optional, for future)
    // Example: handle profilePicture or documents

    const candidate = await Candidate.findByIdAndUpdate(id, updateData, {
      new: true,
      runValidators: true,
    });

    if (!candidate) {
      return res.status(404).json({ message: "Candidate not found" });
    }

    // If interview date and time are being set/scheduled, send email notification
    const isSchedulingInterview =
      updateData.interviewDate || updateData.interviewTime;
    let emailStatus = "not_required";
    if (isSchedulingInterview) {
      try {
        await sendInterviewNotificationEmail(candidate);
        emailStatus = "sent";
      } catch (emailErr) {
        // Never break the interview save if email fails
        emailStatus = "failed";
        console.warn(
          "Failed to send interview notification email:",
          emailErr.message,
        );
      }
    }

    const statusChanged =
      updateData.status && updateData.status !== previousCandidate?.status;
    const action = statusChanged ? "status changed" : "updated";
    await createLog({
      action,
      entityType: "Candidate",
      entityId: candidate._id,
      entityName: candidate.name,
      description: statusChanged
        ? `Candidate ${candidate.name} moved from ${previousCandidate.status || "new"} to ${candidate.status} by ${req.user?.username || "System"}`
        : `Candidate ${candidate.name} has been updated by ${req.user?.username || "System"}`,
      performedBy: req.user?.username || "System",
      performedById: req.user?._id,
      meta: statusChanged
        ? {
            previousStatus: previousCandidate.status,
            newStatus: candidate.status,
          }
        : {},
    });
    res.status(200).json({
      message: "Candidate updated successfully",
      candidate,
      emailStatus,
    });
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
      { new: true },
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
        fileErr,
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
