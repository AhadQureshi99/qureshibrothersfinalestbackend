const Employee = require("../models/employeeModel");
const Attendance = require("../models/employeeAttendanceModel");
const Payroll = require("../models/employeePayrollModel");
const { createLog } = require("./activityLogController");
const multer = require("multer");
const path = require("path");
const fs = require("fs");

// Ensure Uploads/employees directory exists
const uploadDir = path.join(__dirname, "../Uploads/employees");
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// multer storage for employee documents
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadDir),
  filename: (req, file, cb) => {
    const unique = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, `${unique}${path.extname(file.originalname)}`);
  },
});

const upload = multer({ storage, limits: { fileSize: 10 * 1024 * 1024 } });

// Document field names that map to employee model fields
const employeeFileFields = [
  "cvFile",
  "profileImageFile",
  "drivingLicenseFile",
  "cnicFile",
  "characterCertificateFile",
];

// Build an object of file URLs from req.files (single file per field)
const buildFileUrls = (req) => {
  const baseUrl =
    process.env.API_URL || `http://localhost:${process.env.PORT || 3001}`;
  const urls = {};
  if (!req.files) return urls;
  employeeFileFields.forEach((field) => {
    if (req.files[field] && req.files[field][0]) {
      urls[field] =
        `${baseUrl}/Uploads/employees/${req.files[field][0].filename}`;
    }
  });
  return urls;
};

const log = (req, action, entityType, entity) =>
  createLog({
    action,
    entityType,
    entityId: entity._id,
    entityName: entity.fullName || entity.month || entity._id,
    description: `${entityType} ${action}`,
    performedBy: req.user?.username || "System",
    performedById: req.user?._id,
    meta: {},
  });

const validateEmployee = (body, requireEmployeeCode = true) => {
  const fields = ["fullName", "department", "designation", "joiningDate"];
  if (requireEmployeeCode) fields.unshift("employeeCode");
  return (
    fields.find((field) => !String(body[field] || "").trim()) ||
    (Number(body.basicSalary) < 0 || body.basicSalary === ""
      ? "basicSalary"
      : null)
  );
};

const nextEmployeeCode = async () => {
  const employees = await Employee.find({}, "employeeCode").lean();
  const highestNumber = employees.reduce((highest, employee) => {
    const match = /^EMP-(\d+)$/.exec(employee.employeeCode);
    return match ? Math.max(highest, Number(match[1])) : highest;
  }, 0);
  return `EMP-${String(highestNumber + 1).padStart(4, "0")}`;
};

const payrollAmounts = (body, basicSalary) => {
  const amount = (name) => Math.max(0, Number(body[name]) || 0);
  const overtimeHours = amount("overtimeHours");
  const overtimeRate = amount("overtimeRate");
  const allowance = amount("allowance");
  const bonus = amount("bonus");
  const deduction = amount("deduction");
  const taxDeduction = amount("taxDeduction");
  const advanceDeduction = amount("advanceDeduction");
  const loanDeduction = amount("loanDeduction");
  const overtimeAmount = overtimeHours * overtimeRate;
  const grossSalary = basicSalary + allowance + overtimeAmount + bonus;
  const totalDeductions =
    deduction + taxDeduction + advanceDeduction + loanDeduction;
  return {
    basicSalary,
    allowance,
    overtimeHours,
    overtimeRate,
    overtimeAmount,
    bonus,
    grossSalary,
    deduction,
    taxDeduction,
    advanceDeduction,
    loanDeduction,
    totalDeductions,
    netSalary: grossSalary - totalDeductions,
  };
};

exports.getEmployees = async (req, res) => {
  try {
    res.json({ employees: await Employee.find().sort({ createdAt: -1 }) });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Could not fetch employees", error: error.message });
  }
};
exports.getEmployee = async (req, res) => {
  try {
    const employee = await Employee.findById(req.params.id);
    if (!employee)
      return res.status(404).json({ message: "Employee not found" });
    res.json({ employee });
  } catch (error) {
    res.status(400).json({ message: "Invalid employee id" });
  }
};
exports.createEmployee = async (req, res) => {
  try {
    const invalid = validateEmployee(req.body, false);
    if (invalid)
      return res.status(400).json({ message: `${invalid} is required` });
    let employee;
    for (let attempt = 0; attempt < 5; attempt += 1) {
      try {
        employee = await Employee.create({
          ...req.body,
          ...buildFileUrls(req),
          employeeCode: await nextEmployeeCode(),
          basicSalary: Number(req.body.basicSalary),
        });
        break;
      } catch (error) {
        if (error.code !== 11000 || attempt === 4) throw error;
      }
    }
    log(req, "created", "Employee", employee);
    res.status(201).json({ message: "Employee created", employee });
  } catch (error) {
    res.status(error.code === 11000 ? 409 : 500).json({
      message:
        error.code === 11000
          ? "Employee code already exists"
          : "Could not create employee",
      error: error.message,
    });
  }
};
exports.updateEmployee = async (req, res) => {
  try {
    const invalid = validateEmployee(req.body);
    if (invalid)
      return res.status(400).json({ message: `${invalid} is required` });
    const employee = await Employee.findByIdAndUpdate(
      req.params.id,
      {
        ...req.body,
        ...buildFileUrls(req),
        basicSalary: Number(req.body.basicSalary),
      },
      { new: true, runValidators: true },
    );
    if (!employee)
      return res.status(404).json({ message: "Employee not found" });
    log(req, "updated", "Employee", employee);
    res.json({ message: "Employee updated", employee });
  } catch (error) {
    res.status(error.code === 11000 ? 409 : 500).json({
      message:
        error.code === 11000
          ? "Employee code already exists"
          : "Could not update employee",
      error: error.message,
    });
  }
};
exports.upload = upload;
exports.deleteEmployee = async (req, res) => {
  try {
    const employee = await Employee.findByIdAndDelete(req.params.id);
    if (!employee)
      return res.status(404).json({ message: "Employee not found" });
    await Promise.all([
      Attendance.deleteMany({ employeeId: employee._id }),
      Payroll.deleteMany({ employeeId: employee._id }),
    ]);
    log(req, "deleted", "Employee", employee);
    res.json({ message: "Employee and related records deleted" });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Could not delete employee", error: error.message });
  }
};

exports.getAttendance = async (req, res) => {
  try {
    const filter = req.query.date ? { date: req.query.date } : {};
    res.json({
      attendance: await Attendance.find(filter)
        .populate("employeeId", "employeeCode fullName")
        .sort({ date: -1, createdAt: -1 }),
    });
  } catch (error) {
    res.status(500).json({ message: "Could not fetch attendance" });
  }
};
exports.saveAttendance = async (req, res) => {
  try {
    const {
      employeeId,
      date,
      status,
      checkIn = "",
      checkOut = "",
      notes = "",
    } = req.body;
    if (!employeeId || !date || !status)
      return res
        .status(400)
        .json({ message: "Employee, date and status are required" });
    const employee = await Employee.findById(employeeId);
    if (!employee)
      return res.status(404).json({ message: "Employee not found" });
    const attendance = await Attendance.findOneAndUpdate(
      { employeeId, date },
      { status, checkIn, checkOut, notes },
      { new: true, upsert: true, setDefaultsOnInsert: true },
    ).populate("employeeId", "employeeCode fullName");
    log(req, "saved", "Employee Attendance", {
      _id: attendance._id,
      fullName: employee.fullName,
    });
    res.json({ message: "Attendance saved", attendance });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Could not save attendance", error: error.message });
  }
};
exports.deleteAttendance = async (req, res) => {
  try {
    const record = await Attendance.findByIdAndDelete(req.params.id);
    if (!record)
      return res.status(404).json({ message: "Attendance not found" });
    log(req, "deleted", "Employee Attendance", record);
    res.json({ message: "Attendance deleted" });
  } catch {
    res.status(400).json({ message: "Invalid attendance id" });
  }
};

exports.getPayroll = async (req, res) => {
  try {
    res.json({
      payroll: await Payroll.find()
        .populate("employeeId", "employeeCode fullName department designation")
        .sort({ month: -1, createdAt: -1 }),
    });
  } catch {
    res.status(500).json({ message: "Could not fetch payroll" });
  }
};
exports.createPayroll = async (req, res) => {
  try {
    const { employeeId, month } = req.body;
    if (!employeeId || !month)
      return res
        .status(400)
        .json({ message: "Employee and month are required" });
    const employee = await Employee.findById(employeeId);
    if (!employee)
      return res.status(404).json({ message: "Employee not found" });
    const payroll = await Payroll.create({
      employeeId,
      month,
      ...payrollAmounts(req.body, Number(employee.basicSalary)),
    });
    log(req, "generated salary", "Employee Payroll", {
      _id: payroll._id,
      fullName: employee.fullName,
      month,
    });
    res.status(201).json({
      message: "Payroll generated",
      payroll: await payroll.populate(
        "employeeId",
        "employeeCode fullName department designation",
      ),
    });
  } catch (error) {
    res.status(error.code === 11000 ? 409 : 500).json({
      message:
        error.code === 11000
          ? "Payroll already exists for this employee and month"
          : "Could not generate payroll",
      error: error.message,
    });
  }
};
exports.updatePayroll = async (req, res) => {
  try {
    const existing = await Payroll.findById(req.params.id).populate(
      "employeeId",
      "fullName",
    );
    if (!existing)
      return res.status(404).json({ message: "Payroll not found" });
    const payroll = await Payroll.findByIdAndUpdate(
      req.params.id,
      payrollAmounts(req.body, existing.basicSalary),
      { new: true },
    ).populate("employeeId", "employeeCode fullName department designation");
    log(req, "updated salary", "Employee Payroll", {
      _id: payroll._id,
      fullName: payroll.employeeId?.fullName,
      month: payroll.month,
    });
    res.json({ message: "Payroll updated", payroll });
  } catch {
    res.status(400).json({ message: "Could not update payroll" });
  }
};
exports.deletePayroll = async (req, res) => {
  try {
    const payroll = await Payroll.findByIdAndDelete(req.params.id).populate(
      "employeeId",
      "fullName",
    );
    if (!payroll) return res.status(404).json({ message: "Payroll not found" });
    log(req, "deleted salary", "Employee Payroll", {
      _id: payroll._id,
      fullName: payroll.employeeId?.fullName,
      month: payroll.month,
    });
    res.json({ message: "Payroll deleted" });
  } catch {
    res.status(400).json({ message: "Invalid payroll id" });
  }
};
