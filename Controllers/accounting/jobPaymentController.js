const JobPayment = require("../../models/accounting/jobPaymentModel");
const asyncHandler = require("express-async-handler");

// @desc    Get all job payments
// @route   GET /api/accounting/job-payments
// @access  Private
const getJobPayments = asyncHandler(async (req, res) => {
  const jobPayments = await JobPayment.find({})
    .populate("employer", "name email phone")
    .populate("job", "title")
    .sort({ createdAt: -1 });

  res.status(200).json(jobPayments);
});

// @desc    Create a new job payment
// @route   POST /api/accounting/job-payments
// @access  Private
const createJobPayment = asyncHandler(async (req, res) => {
  const {
    employer,
    job,
    unSkilled,
    semiSkilled,
    skilled,
    highlySkilled,
    highlyQualified,
  } = req.body;

  const jobPayment = await JobPayment.create({
    employer,
    job,
    unSkilled: unSkilled || 0,
    semiSkilled: semiSkilled || 0,
    skilled: skilled || 0,
    highlySkilled: highlySkilled || 0,
    highlyQualified: highlyQualified || 0,
  });

  const populatedJobPayment = await JobPayment.findById(jobPayment._id)
    .populate("employer", "name email phone")
    .populate("job", "title");

  res.status(201).json(populatedJobPayment);
});

// @desc    Update a job payment
// @route   PUT /api/accounting/job-payments/:id
// @access  Private
const updateJobPayment = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const {
    employer,
    job,
    unSkilled,
    semiSkilled,
    skilled,
    highlySkilled,
    highlyQualified,
  } = req.body;

  const jobPayment = await JobPayment.findById(id);

  if (!jobPayment) {
    res.status(404);
    throw new Error("Job payment not found");
  }

  jobPayment.employer = employer || jobPayment.employer;
  jobPayment.job = job || jobPayment.job;
  jobPayment.unSkilled =
    unSkilled !== undefined ? unSkilled : jobPayment.unSkilled;
  jobPayment.semiSkilled =
    semiSkilled !== undefined ? semiSkilled : jobPayment.semiSkilled;
  jobPayment.skilled = skilled !== undefined ? skilled : jobPayment.skilled;
  jobPayment.highlySkilled =
    highlySkilled !== undefined ? highlySkilled : jobPayment.highlySkilled;
  jobPayment.highlyQualified =
    highlyQualified !== undefined
      ? highlyQualified
      : jobPayment.highlyQualified;
  jobPayment.updatedAt = Date.now();

  const updatedJobPayment = await jobPayment.save();

  const populatedJobPayment = await JobPayment.findById(updatedJobPayment._id)
    .populate("employer", "name email phone")
    .populate("job", "title");

  res.status(200).json(populatedJobPayment);
});

// @desc    Delete a job payment
// @route   DELETE /api/accounting/job-payments/:id
// @access  Private
const deleteJobPayment = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const jobPayment = await JobPayment.findById(id);

  if (!jobPayment) {
    res.status(404);
    throw new Error("Job payment not found");
  }

  await JobPayment.findByIdAndDelete(id);

  res.status(200).json({ message: "Job payment deleted successfully" });
});

module.exports = {
  getJobPayments,
  createJobPayment,
  updateJobPayment,
  deleteJobPayment,
};
