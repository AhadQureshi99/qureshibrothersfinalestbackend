const express = require("express");
const router = express.Router();
const auth = require("../middelwares/authMiddleware");
const controller = require("../Controllers/employeeController");

router.use(auth);
router.get("/", controller.getEmployees);
router.post("/", controller.createEmployee);
router.get("/attendance", controller.getAttendance);
router.post("/attendance", controller.saveAttendance);
router.delete("/attendance/:id", controller.deleteAttendance);
router.get("/payroll", controller.getPayroll);
router.post("/payroll", controller.createPayroll);
router.put("/payroll/:id", controller.updatePayroll);
router.delete("/payroll/:id", controller.deletePayroll);
router.get("/:id", controller.getEmployee);
router.put("/:id", controller.updateEmployee);
router.delete("/:id", controller.deleteEmployee);

module.exports = router;
