const mongoose = require("mongoose");

const employerSchema = new mongoose.Schema(
  {
    code: {
      type: String,
      required: true,
      unique: true,
    },
    username: {
      type: String,
      required: true,
    },
    companyName: {
      type: String,
      required: true,
    },
    city: {
      type: String,
      required: true,
    },
    state: {
      type: String,
      required: true,
    },
    country: {
      type: String,
      required: true,
    },
    password: {
      type: String,
      required: true,
    },
    ownership: {
      type: String,
    },
    sector: {
      type: String,
    },
    salesTurnover: {
      type: String,
    },
    numberOfEmployees: {
      type: String,
    },
    numberOfOffices: {
      type: String,
    },
    companyInfo: {
      type: String,
    },
    companyAddress: {
      type: String,
    },
    zip: {
      type: String,
    },
    street: {
      type: String,
    },
    fax: {
      type: String,
    },
    website: {
      type: String,
    },
    plan: {
      type: String,
    },
    phone: {
      type: String,
    },
    type: {
      type: String,
    },
    email: {
      type: String,
      required: true,
    },
    contactPersonName: {
      type: String,
    },
    contactPersonPhone: {
      type: String,
    },
    files: [
      {
        type: String, // URLs or paths to uploaded files
      },
    ],
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Employer", employerSchema);
