const mongoose = require("mongoose");

const employeeAttendanceSchema = new mongoose.Schema(
  {
    employeeId: { type: mongoose.Schema.Types.ObjectId, ref: "Employee", required: true },
    date: { type: String, required: true },
    status: { type: String, enum: ["Present", "Absent", "Late", "Half Day", "Casual Leave", "Sick Leave", "Annual Leave", "Unpaid Leave"], required: true },
    checkIn: { type: String, default: "" },
    checkOut: { type: String, default: "" },
    notes: { type: String, trim: true, default: "" },
  },
  { timestamps: true },
);

employeeAttendanceSchema.index({ employeeId: 1, date: 1 }, { unique: true });
module.exports = mongoose.model("EmployeeAttendance", employeeAttendanceSchema);
