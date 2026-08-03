const express = require("express");
const router = express.Router();
const auth = require("../middelwares/authMiddleware");
const controller = require("../Controllers/employeeController");
const {
  requirePermission,
  requireAnyEmployeeView,
  requireEitherPermission,
} = require("../middelwares/permissionMiddleware");

router.use(auth);

// Accept document file uploads (single file per employee document field)
const employeeUpload = controller.upload.fields([
  { name: "cvFile", maxCount: 1 },
  { name: "profileImageFile", maxCount: 1 },
  { name: "drivingLicenseFile", maxCount: 1 },
  { name: "cnicFile", maxCount: 1 },
  { name: "characterCertificateFile", maxCount: 1 },
]);

router.get("/", requireAnyEmployeeView, controller.getEmployees);
router.post(
  "/",
  requirePermission("employeeManagement", "addEmployee", "add"),
  employeeUpload,
  controller.createEmployee,
);
router.get("/attendance", requireAnyEmployeeView, controller.getAttendance);
router.post(
  "/attendance",
  requireEitherPermission("employeeManagement", "attendance", ["add", "edit"]),
  controller.saveAttendance,
);
router.delete(
  "/attendance/:id",
  requirePermission("employeeManagement", "attendance", "delete"),
  controller.deleteAttendance,
);
router.get("/payroll", requireAnyEmployeeView, controller.getPayroll);
router.post(
  "/payroll",
  requirePermission("employeeManagement", "payroll", "add"),
  controller.createPayroll,
);
router.put(
  "/payroll/:id",
  requirePermission("employeeManagement", "payroll", "edit"),
  controller.updatePayroll,
);
router.delete(
  "/payroll/:id",
  requirePermission("employeeManagement", "payroll", "delete"),
  controller.deletePayroll,
);
router.get("/:id", requireAnyEmployeeView, controller.getEmployee);
router.put(
  "/:id",
  requirePermission("employeeManagement", "manageEmployees", "edit"),
  employeeUpload,
  controller.updateEmployee,
);
router.delete(
  "/:id",
  requirePermission("employeeManagement", "manageEmployees", "delete"),
  controller.deleteEmployee,
);

module.exports = router;
