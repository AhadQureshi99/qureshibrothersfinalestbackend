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
    name: { type: String },
    fatherName: { type: String },
    gender: { type: String },
    age: { type: Number },
    dob: { type: Date },
    profession: { type: String },
    qualification: { type: String },
    placeOfBirth: { type: String },
    cnic: { type: String },
    passport: { type: String },
    ppIssue: { type: Date },
    ppExpiry: { type: Date },
    address: { type: String },
    city: { type: String },
    state: { type: String },
    country: { type: String },
    contact: { type: String },
    maritalStatus: { type: String },
    salary: { type: String },
    status: { type: String, default: "Applied" },
    receiveDate: { type: Date },
    profilePicture: { type: String },
    documents: [documentSchema],
  },
  { timestamps: true }
);

module.exports =
  mongoose.models.Candidate || mongoose.model("Candidate", candidateSchema);
