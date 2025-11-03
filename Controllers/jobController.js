const Job = require("../models/jobModel");
const asyncHandler = require("express-async-handler");

// @desc    Get all jobs
// @route   GET /api/jobs
// @access  Private
const getJobs = asyncHandler(async (req, res) => {
  const jobs = await Job.find({})
    .populate("createdBy", "username email")
    .sort({ createdAt: -1 });

  res.status(200).json({ jobs });
});

// @desc    Get single job
// @route   GET /api/jobs/:id
// @access  Private
const getJob = asyncHandler(async (req, res) => {
  const job = await Job.findById(req.params.id).populate(
    "createdBy",
    "username email"
  );

  if (!job) {
    res.status(404);
    throw new Error("Job not found");
  }

  res.status(200).json(job);
});

// @desc    Create a new job
// @route   POST /api/jobs
// @access  Private
const createJob = asyncHandler(async (req, res) => {
  const {
    employer,
    jobTitle,
    jobNo,
    processTypes,
    receiptDate,
    letterNo,
    visaNo,
    numberOfVisa,
    visaDate,
    currency,
    permissionNo,
    permissionDate,
    issuanceDate,
    deadlineDate,
    salaryAmount,
    deploymentArea,
    city,
    state,
    country,
    categories,
    jobTitleForDisplay,
    type,
    noOfPerson,
    educationalCategory,
    educationLevel,
    experienceRange,
    ageRange,
    salaryRange,
    careerLevel,
    salary,
    contractDuration,
    skills,
    additionalExperience,
    jobDetails,
    specialInstructions,
    jobDescription,
    jobType,
    applyMode,
    jobStatus,
    showOnWeb,
  } = req.body;

  // Validation
  if (
    !employer ||
    !jobTitle ||
    !jobNo ||
    !processTypes ||
    !permissionNo ||
    !permissionDate ||
    !categories ||
    !jobTitleForDisplay ||
    !type ||
    !noOfPerson ||
    !salary ||
    !contractDuration
  ) {
    res.status(400);
    throw new Error("Please fill in all required fields");
  }

  const job = await Job.create({
    employer,
    jobTitle,
    jobNo,
    processTypes,
    receiptDate,
    letterNo,
    visaNo,
    numberOfVisa,
    visaDate,
    currency,
    permissionNo,
    permissionDate,
    issuanceDate,
    deadlineDate,
    salaryAmount,
    deploymentArea,
    city,
    state,
    country,
    categories,
    jobTitleForDisplay,
    type,
    noOfPerson,
    educationalCategory,
    educationLevel,
    experienceRange,
    ageRange,
    salaryRange,
    careerLevel,
    salary,
    contractDuration,
    skills,
    additionalExperience,
    jobDetails,
    specialInstructions,
    jobDescription,
    jobType,
    applyMode,
    jobStatus,
    showOnWeb,
    createdBy: req.user._id,
  });

  const populatedJob = await Job.findById(job._id).populate(
    "createdBy",
    "username email"
  );

  res.status(201).json({
    message: "Job created successfully",
    job: populatedJob,
  });
});

// @desc    Update a job
// @route   PUT /api/jobs/:id
// @access  Private
const updateJob = asyncHandler(async (req, res) => {
  const job = await Job.findById(req.params.id);

  if (!job) {
    res.status(404);
    throw new Error("Job not found");
  }

  const {
    employer,
    jobTitle,
    jobNo,
    processTypes,
    receiptDate,
    letterNo,
    visaNo,
    numberOfVisa,
    visaDate,
    currency,
    permissionNo,
    permissionDate,
    issuanceDate,
    deadlineDate,
    salaryAmount,
    deploymentArea,
    city,
    state,
    country,
    categories,
    jobTitleForDisplay,
    type,
    noOfPerson,
    educationalCategory,
    educationLevel,
    experienceRange,
    ageRange,
    salaryRange,
    careerLevel,
    salary,
    contractDuration,
    skills,
    additionalExperience,
    jobDetails,
    specialInstructions,
    jobDescription,
    jobType,
    applyMode,
    jobStatus,
    showOnWeb,
  } = req.body;

  // Update fields
  job.employer = employer || job.employer;
  job.jobTitle = jobTitle || job.jobTitle;
  job.jobNo = jobNo || job.jobNo;
  job.processTypes = processTypes || job.processTypes;
  job.receiptDate = receiptDate || job.receiptDate;
  job.letterNo = letterNo || job.letterNo;
  job.visaNo = visaNo || job.visaNo;
  job.numberOfVisa =
    numberOfVisa !== undefined ? numberOfVisa : job.numberOfVisa;
  job.visaDate = visaDate || job.visaDate;
  job.currency = currency || job.currency;
  job.permissionNo = permissionNo || job.permissionNo;
  job.permissionDate = permissionDate || job.permissionDate;
  job.issuanceDate = issuanceDate || job.issuanceDate;
  job.deadlineDate = deadlineDate || job.deadlineDate;
  job.salaryAmount =
    salaryAmount !== undefined ? salaryAmount : job.salaryAmount;
  job.deploymentArea = deploymentArea || job.deploymentArea;
  job.city = city || job.city;
  job.state = state || job.state;
  job.country = country || job.country;
  job.categories = categories || job.categories;
  job.jobTitleForDisplay = jobTitleForDisplay || job.jobTitleForDisplay;
  job.type = type || job.type;
  job.noOfPerson = noOfPerson !== undefined ? noOfPerson : job.noOfPerson;
  job.educationalCategory = educationalCategory || job.educationalCategory;
  job.educationLevel = educationLevel || job.educationLevel;
  job.experienceRange = experienceRange || job.experienceRange;
  job.ageRange = ageRange || job.ageRange;
  job.salaryRange = salaryRange || job.salaryRange;
  job.careerLevel = careerLevel || job.careerLevel;
  job.salary = salary !== undefined ? salary : job.salary;
  job.contractDuration =
    contractDuration !== undefined ? contractDuration : job.contractDuration;
  job.skills = skills || job.skills;
  job.additionalExperience = additionalExperience || job.additionalExperience;
  job.jobDetails = job.jobDetails;
  job.specialInstructions = specialInstructions || job.specialInstructions;
  job.jobDescription = jobDescription || job.jobDescription;
  job.jobType = jobType || job.jobType;
  job.applyMode = applyMode || job.applyMode;
  job.jobStatus = jobStatus || job.jobStatus;
  job.showOnWeb = showOnWeb !== undefined ? showOnWeb : job.showOnWeb;

  const updatedJob = await job.save();

  const populatedJob = await Job.findById(updatedJob._id).populate(
    "createdBy",
    "username email"
  );

  res.status(200).json({
    message: "Job updated successfully",
    job: populatedJob,
  });
});

// @desc    Delete a job
// @route   DELETE /api/jobs/:id
// @access  Private
const deleteJob = asyncHandler(async (req, res) => {
  const job = await Job.findById(req.params.id);

  if (!job) {
    res.status(404);
    throw new Error("Job not found");
  }

  await job.deleteOne();

  res.status(200).json({
    message: "Job deleted successfully",
  });
});

module.exports = {
  getJobs,
  getJob,
  createJob,
  updateJob,
  deleteJob,
};
