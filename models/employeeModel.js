const mongoose = require("mongoose");

const employeeSchema = new mongoose.Schema(
  {
    employeeCode: { type: String, required: true, unique: true, trim: true },
    fullName: { type: String, required: true, trim: true },
    department: { type: String, required: true, trim: true },
    designation: { type: String, required: true, trim: true },
    phone: { type: String, trim: true, default: "" },
    email: { type: String, trim: true, lowercase: true, default: "" },
    cnic: { type: String, trim: true, default: "" },
    joiningDate: { type: Date, required: true },
    basicSalary: { type: Number, required: true, min: 0 },
    status: { type: String, enum: ["Active", "Inactive"], default: "Active" },

    // Document upload fields
    cvFile: { type: String, default: "" },
    profileImageFile: { type: String, default: "" },
    drivingLicenseFile: { type: String, default: "" },
    cnicFile: { type: String, default: "" },
    characterCertificateFile: { type: String, default: "" },
  },
  { timestamps: true },
);

module.exports = mongoose.model("Employee", employeeSchema);
