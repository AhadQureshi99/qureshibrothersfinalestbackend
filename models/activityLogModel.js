const mongoose = require("mongoose");

const activityLogSchema = new mongoose.Schema(
  {
    action: { type: String, required: true }, // e.g. created, updated, deleted, moved
    entityType: { type: String, required: true }, // e.g. Candidate, User, Job
    entityId: { type: mongoose.Schema.Types.ObjectId, required: false },
    entityName: { type: String }, // e.g. candidate name, job title
    description: { type: String }, // e.g. 'Candidate Yasir Ali has been deleted by Umer Aziz'
    performedBy: { type: String, required: true }, // e.g. 'Umer Aziz'
    performedById: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    meta: { type: Object }, // any extra info
  },
  { timestamps: true }
);

module.exports =
  mongoose.models.ActivityLog ||
  mongoose.model("ActivityLog", activityLogSchema);
