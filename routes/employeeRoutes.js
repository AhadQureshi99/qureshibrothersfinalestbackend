const express = require("express");
const router = express.Router();
const auth = require("../middelwares/authMiddleware");
const controller = require("../Controllers/employeeController");
const { requirePermission, requireAnyEmployeeView, requireEitherPermission } = require("../middelwares/permissionMiddleware");

router.use(auth);
router.get("/", requireAnyEmployeeView, controller.getEmployees);
router.post("/", requirePermission("employeeManagement", "addEmployee", "add"), controller.createEmployee);
router.get("/attendance", requireAnyEmployeeView, controller.getAttendance);
router.post("/attendance", requireEitherPermission("employeeManagement", "attendance", ["add", "edit"]), controller.saveAttendance);
router.delete("/attendance/:id", requirePermission("employeeManagement", "attendance", "delete"), controller.deleteAttendance);
router.get("/payroll", requireAnyEmployeeView, controller.getPayroll);
router.post("/payroll", requirePermission("employeeManagement", "payroll", "add"), controller.createPayroll);
router.put("/payroll/:id", requirePermission("employeeManagement", "payroll", "edit"), controller.updatePayroll);
router.delete("/payroll/:id", requirePermission("employeeManagement", "payroll", "delete"), controller.deletePayroll);
router.get("/:id", requireAnyEmployeeView, controller.getEmployee);
router.put("/:id", requirePermission("employeeManagement", "manageEmployees", "edit"), controller.updateEmployee);
router.delete("/:id", requirePermission("employeeManagement", "manageEmployees", "delete"), controller.deleteEmployee);

module.exports = router;
