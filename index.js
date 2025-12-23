const express = require("express");
const errorHandler = require("./middelwares/errorMiddleware");
const connectDB = require("./config/connectDB");
const cors = require("cors");
const path = require("path");

const app = express();

require("dotenv").config();
require("colors");

const corsOptions = {
  origin: [
    "http://localhost:5173",
    "https://qureshi-brothers-dashboard.netlify.app",
    "https://qureshi-brothers-frontend-ujhe.vercel.app",
    "https://api.cloudandroots.com",
    "https://qureshi-brothers-frontend-qonsb86bf-ahad-qureshis-projects.vercel.app",
    "https://qureshi-brothers-frontend-dmb3scgfo-ahad-qureshis-projects.vercel.app",
    "https://qureshi-brothers-frontend-8b3q3gm2c-ahad-qureshis-projects.vercel.app",
  ],
  credentials: true,
};

app.use(cors(corsOptions));

// Use the same cors options for preflight responses so OPTIONS replies include the same headers
app.options("*", cors(corsOptions)); // IMPORTANT for preflight

connectDB();

app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Serve static files
// Serve static files under /Uploads and force inline Content-Disposition so
// browsers will attempt to view documents (PDFs, images) inline instead of
// prompting for download. Also ensure CORS headers are present for these
// responses.
app.use("/Uploads", (req, res, next) => {
  // Allow the frontend origins already configured in corsOptions. If the
  // request origin is present and allowed, echo it; otherwise fall back to '*'.
  try {
    const origin = req.headers.origin;
    if (
      origin &&
      corsOptions &&
      Array.isArray(corsOptions.origin) &&
      corsOptions.origin.includes(origin)
    ) {
      res.setHeader("Access-Control-Allow-Origin", origin);
    } else {
      res.setHeader("Access-Control-Allow-Origin", "*");
    }
  } catch (e) {
    res.setHeader("Access-Control-Allow-Origin", "*");
  }
  res.setHeader("Access-Control-Allow-Credentials", "true");
  return next();
});
app.use(
  "/Uploads",
  express.static(path.join(__dirname, "Uploads"), {
    setHeaders: (res, filePath) => {
      // Prefer inline display when possible
      res.setHeader("Content-Disposition", "inline");
      // Let express set Content-Type based on the file extension as usual
    },
  })
);

app.use("/api/users/", require("./routes/userRoutes"));
app.use("/api/expenses/", require("./routes/expenseRoutes"));
app.use("/api/candidates/", require("./routes/candidateRoutes"));
app.use("/api/config/", require("./routes/configRoutes"));
app.use(
  "/api/config/recruitment-agents/",
  require("./routes/recruitmentAgentRoutes")
);
app.use("/api/config/travel-agents/", require("./routes/travelAgentRoutes"));
app.use("/api/config/visa-categories/", require("./routes/visaCategoryRoutes"));
app.use(
  "/api/config/visa-issuing-authorities/",
  require("./routes/visaIssuingAuthorityRoutes")
);
app.use(
  "/api/config/education-categories/",
  require("./routes/educationCategoryRoutes")
);
app.use("/api/jobs/", require("./routes/jobRoutes"));
app.use("/api/config/job-categories/", require("./routes/jobCategoryRoutes"));
app.use("/api/config/sub-categories/", require("./routes/subCategoryRoutes"));
app.use(
  "/api/config/working-categories/",
  require("./routes/workingCategoryRoutes")
);
app.use(
  "/api/config/verifying-institutions/",
  require("./routes/verifyingInstitutionRoutes")
);
app.use("/api/config/test-centers/", require("./routes/testCenterRoutes"));
app.use(
  "/api/config/medical-centers/",
  require("./routes/medicalCenterRoutes")
);
app.use("/api/config/test-types/", require("./routes/testTypeRoutes"));
app.use("/api/config/age-ranges/", require("./routes/ageRangeRoutes"));
app.use("/api/config/salary-ranges/", require("./routes/salaryRangeRoutes"));
app.use(
  "/api/config/experience-ranges/",
  require("./routes/experienceRangeRoutes")
);
app.use("/api/config/airlines/", require("./routes/airlineRoutes"));
app.use(
  "/api/config/visa-professions/",
  require("./routes/visaProfessionRoutes")
);
app.use(
  "/api/config/working-sectors/",
  require("./routes/workingSectorRoutes")
);
app.use("/api/config/cities/", require("./routes/cityRoutes"));
app.use(
  "/api/config/education-levels/",
  require("./routes/educationLevelRoutes")
);
app.use("/api/config/career-levels/", require("./routes/careerLevelRoutes"));
app.use("/api/skills/", require("./routes/skillRoutes"));
app.use(
  "/api/accounting/accounts/",
  require("./routes/accounting/accountRoutes")
);
app.use(
  "/api/accounting/transactions/",
  require("./routes/accounting/transactionRoutes")
);
app.use(
  "/api/accounting/opening-balances/",
  require("./routes/accounting/openingBalanceRoutes")
);
app.use(
  "/api/accounting/reports/",
  require("./routes/accounting/reportRoutes")
);
app.use(
  "/api/accounting/job-payments/",
  require("./routes/accounting/jobPaymentRoutes")
);
app.use(
  "/api/accounting/travel-agent-payments/",
  require("./routes/accounting/travelAgentPaymentRoutes")
);
app.use("/api/roles/", require("./routes/roleRoutes"));
app.use("/api/employers/", require("./routes/employerRoutes"));
app.use("/api/employer-plans/", require("./routes/employerPlanRoutes"));
app.use(
  "/api/employer-management/",
  require("./routes/employerManagementRoutes")
);

app.use(errorHandler);

const PORT = process.env.PORT || 3001;
const server = app.listen(PORT, () =>
  console.log(`Server started on port: ${PORT}`)
);

server.on("error", (err) => {
  if (err && err.code === "EADDRINUSE") {
    console.error(
      `Port ${PORT} is already in use. Ensure no other process is listening on this port and try again.`
    );
  } else {
    console.error("Server error:", err);
  }
});

// Export app for testing or programmatic control
module.exports = app;

// Catch unhandled errors and promise rejections to aid debugging in dev
process.on("uncaughtException", (err) => {
  console.error("Uncaught Exception:", err);
  // optional: process.exit(1);
});

process.on("unhandledRejection", (reason, promise) => {
  console.error("Unhandled Rejection at:", promise, "reason:", reason);
  // optional: process.exit(1);
});
