const mongoose = require("mongoose");

const documentSchema = new mongoose.Schema({
  title: { type: String },
  url: { type: String },
  filename: { type: String },
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
  },
  { timestamps: true },
);

module.exports =
  mongoose.models.Candidate || mongoose.model("Candidate", candidateSchema);
