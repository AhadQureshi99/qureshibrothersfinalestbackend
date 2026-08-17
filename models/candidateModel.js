const mongoose = require("mongoose");

const documentSchema = new mongoose.Schema({
  title: { type: String },
  url: { type: String },
  filename: { type: String },
  originalName: { type: String },
  date: { type: String },
  stage: { type: String },
  done: { type: Boolean, default: false },
  passed: { type: Boolean, default: false },
});

const candidateSchema = new mongoose.Schema(
  {
    // Basic Info Fields
    name: { type: String },
    username: { type: String },
    password: { type: String },
    candidateType: { type: String },
    title: { type: String },
    firstName: { type: String },
    lastName: { type: String },
    cnic: { type: String },
    fatherName: { type: String },
    gender: { type: String },
    dateOfBirth: { type: Date },
    age: { type: Number },
    placeOfBirth: { type: String },
    nationality: { type: String },
    maritalStatus: { type: String },
    education: { type: String },
    profession: { type: String },
    experience: { type: String },
    jobType: { type: String },
    jobAppliedFor: { type: String },
    plan: { type: String },
    religion: { type: String },
    wages: { type: String },
    address: { type: String },

    // Passport Info Fields
    passportNumber: { type: String },
    passportIssueDate: { type: Date },
    passportExpiryDate: { type: Date },
    passportIssuePlace: { type: String },

    // Residence Info Fields
    country: { type: String },
    state: { type: String },
    province: { type: String },
    zip: { type: String },
    district: { type: String },
    city: { type: String },
    street: { type: String },

    // Contact Details Fields
    phone: { type: String },
    mobile: { type: String },
    email: { type: String },
    fax: { type: String },
    website: { type: String },
    contactAddress: { type: String },
    returnAddress: { type: String },
    emergencyContact: { type: String },
    emergencyContactRelation: { type: String },

    // Skills Array
    skills: [
      {
        from: { type: String },
        to: { type: String },
        degree: { type: String },
        institute: { type: String },
        duration: { type: String },
      },
    ],

    educations: [
      {
        from: { type: String },
        to: { type: String },
        degree: { type: String },
        institute: { type: String },
        duration: { type: String },
      },
    ],

    // Present Status Fields
    currentStatus: { type: String },
    statusDate: { type: Date },
    convicted: { type: String },
    politicalAffiliation: { type: String },
    presentEmployment: { type: String },
    achievements: { type: String },

    // Dependents Array
    dependents: [
      {
        dependent: { type: String },
        gender: { type: String },
        age: { type: Number },
      },
    ],

    // Resumes Array
    resumes: [
      {
        filename: { type: String },
        url: { type: String },
        uploadedAt: { type: Date, default: Date.now },
      },
    ],

    // Documents Array
    documents: [documentSchema],

    // Status and Other Fields
    status: { type: String, default: "Applied" },
    profilePicture: { type: String },

    // Legacy fields for backward compatibility
    dob: { type: Date },
    qualification: { type: String },
    passport: { type: String },
    ppIssue: { type: Date },
    ppExpiry: { type: Date },
    contact: { type: String },
    salary: { type: String },
    receiveDate: { type: Date },
    date: { type: Date },
    companyNameEnglish: { type: String },
    companyNameArabic: { type: String },
    tradeEnglish: { type: String },
    tradeArabic: { type: String },
    visaId: { type: String },
    visaNo: { type: String },
    eNo: { type: String },

    // Interview Schedule fields
    interviewDate: { type: Date },
    interviewTime: { type: String },
    interviewLocation: { type: String },
    interviewNotes: { type: String },
    interviewStatus: { type: String }, // e.g., "Scheduled", "Completed", "Passed", "Failed"

    // Document Upload Stage fields - Fee
    totalFee: { type: String },
    depositedFee: { type: String },
    feeDone: { type: Boolean, default: false },
    feeDate: { type: String },

    // Document Upload Stage fields - Basic Requirements
    navttcAppointmentDone: { type: Boolean, default: false },
    navttcAppointmentDate: { type: String },
    navttcTestDone: { type: Boolean, default: false },
    navttcDate: { type: String },
    medicalAppointmentDone: { type: Boolean, default: false },
    medicalAppointmentDate: { type: String },
    medicalTestDone: { type: Boolean, default: false },
    medicalTestDate: { type: String },
    pccDone: { type: Boolean, default: false },
    pccDate: { type: String },

    // Document Upload Stage fields - E-Number
    eNoIssued: { type: Boolean, default: false },
    eNoDate: { type: String },

    // Document Upload Stage fields - Agency
    agencyLicense: { type: Boolean, default: false },
    agencyDate: { type: String },

    // Document Upload Stage fields - Documents (flags + dates)
    documentDetails: [
      {
        name: { type: String },
        checked: { type: Boolean, default: false },
        date: { type: String },
      },
    ],
  },
  { timestamps: true },
);

// Helper: dedupe documents/resumes preserving first occurrence
function dedupeDocuments(arr) {
  if (!Array.isArray(arr)) return arr;
  const seen = new Set();
  const out = [];
  for (const item of arr) {
    if (!item) continue;
    const key =
      (item.originalName && String(item.originalName).trim()) ||
      (item.url && String(item.url).split("/").pop()) ||
      (item.filename && String(item.filename).trim()) ||
      JSON.stringify(item);
    if (!key) continue;
    if (seen.has(key)) continue;
    seen.add(key);
    out.push(item);
  }
  return out;
}

function dedupeResumes(arr) {
  if (!Array.isArray(arr)) return arr;
  const seen = new Set();
  const out = [];
  for (const item of arr) {
    if (!item) continue;
    const key =
      (item.originalName && String(item.originalName).trim()) ||
      (item.url && String(item.url).split("/").pop()) ||
      (item.filename && String(item.filename).trim()) ||
      JSON.stringify(item);
    if (!key) continue;
    if (seen.has(key)) continue;
    seen.add(key);
    out.push(item);
  }
  return out;
}

// Ensure duplicates are removed before saving a new candidate document
candidateSchema.pre("save", function (next) {
  try {
    if (this.documents) this.documents = dedupeDocuments(this.documents);
    if (this.resumes) this.resumes = dedupeResumes(this.resumes);
  } catch (e) {
    // don't block save for dedupe failures; log and continue
    // eslint-disable-next-line no-console
    console.warn("candidateModel dedupe pre-save failed:", e && e.message);
  }
  return next();
});

// When updates use findOneAndUpdate / findByIdAndUpdate, normalize any provided
// `documents` or `resumes` arrays on the update payload to remove duplicates.
candidateSchema.pre("findOneAndUpdate", function (next) {
  try {
    const upd = this.getUpdate() || {};
    // Support both direct set and $set shapes
    const target = upd.$set || upd;
    if (target.documents) target.documents = dedupeDocuments(target.documents);
    if (target.resumes) target.resumes = dedupeResumes(target.resumes);
    // Apply back if we mutated $set
    if (upd.$set) this.setUpdate(upd);
  } catch (e) {
    // eslint-disable-next-line no-console
    console.warn(
      "candidateModel dedupe pre-findOneAndUpdate failed:",
      e && e.message,
    );
  }
  return next();
});

module.exports =
  mongoose.models.Candidate || mongoose.model("Candidate", candidateSchema);
