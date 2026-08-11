const Job = require("../models/jobModel");
const Company = require("../models/companyModel");
const { createLog } = require("./activityLogController");
const asyncHandler = require("express-async-handler");

// @desc    Get all jobs
// @route   GET /api/jobs
// @access  Private
const getJobs = asyncHandler(async (req, res) => {
  const jobs = await Job.find({})
    .populate("createdBy", "username email")
    .populate("companyId", "name email phone address logo")
    .sort({ createdAt: -1 });

  res.status(200).json({ jobs });
});

// @desc    Get single job
// @route   GET /api/jobs/:id
// @access  Private
const getJob = asyncHandler(async (req, res) => {
  const job = await Job.findById(req.params.id)
    .populate("createdBy", "username email")
    .populate("companyId", "name email phone address logo");

  if (!job) {
    res.status(404);
    throw new Error("Job not found");
  }

  res.status(200).json(job);
});

// @desc    Create new jobs (single or bulk)
// @route   POST /api/jobs
// @access  Private
const createJob = asyncHandler(async (req, res) => {
  const { jobs } = req.body;

  // Support both single job and bulk jobs array
  const jobsToCreate = Array.isArray(jobs) ? jobs : [req.body];

  if (jobsToCreate.length === 0) {
    res.status(400);
    throw new Error("No jobs provided");
  }

  const createdJobs = [];

  for (const jobData of jobsToCreate) {
    const {
      companyId,
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
    } = jobData;

    // Validation
    if (
      !companyId ||
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

    // Verify company exists
    const company = await Company.findById(companyId);
    if (!company) {
      res.status(400);
      throw new Error(`Company not found for job: ${jobTitle}`);
    }

    const job = await Job.create({
      companyId,
      employer: employer || company.name,
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

    createdJobs.push(job);
  }

  const populatedJobs = await Job.find({ _id: { $in: createdJobs.map(j => j._id) } })
    .populate("createdBy", "username email")
    .populate("companyId", "name email phone address logo");

  // Log activity
  await createLog({
    action: "created",
    entityType: "Job",
    entityId: createdJobs[0]._id,
    entityName: createdJobs.length > 1 ? `${createdJobs.length} jobs` : createdJobs[0].jobTitle,
    description: `${createdJobs.length > 1 ? `${createdJobs.length} new jobs` : `New job ${createdJobs[0].jobTitle}`} has been created by ${
      req.user?.username || "System"
    }`,
    performedBy: req.user?.username || "System",
    performedById: req.user?._id,
    meta: { count: createdJobs.length },
  });

  res.status(201).json({
    message: createdJobs.length > 1 ? `${createdJobs.length} jobs created successfully` : "Job created successfully",
    jobs: populatedJobs,
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
    companyId,
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
  job.companyId = companyId || job.companyId;
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

  const populatedJob = await Job.findById(updatedJob._id)
    .populate("createdBy", "username email")
    .populate("companyId", "name email phone address logo");

  // Log activity
  await createLog({
    action: "updated",
    entityType: "Job",
    entityId: populatedJob._id,
    entityName: populatedJob.jobTitle,
    description: `Job ${populatedJob.jobTitle} has been updated by ${
      req.user?.username || "System"
    }`,
    performedBy: req.user?.username || "System",
    performedById: req.user?._id,
    meta: {},
  });
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
  // Log activity
  await createLog({
    action: "deleted",
    entityType: "Job",
    entityId: job._id,
    entityName: job.jobTitle,
    description: `The Job ${job.jobTitle} has been deleted by ${
      req.user?.username || "System"
    }`,
    performedBy: req.user?.username || "System",
    performedById: req.user?._id,
    meta: {},
  });
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
