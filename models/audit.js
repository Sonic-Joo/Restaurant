const mongoose = require("mongoose");

const auditLogSchema = new mongoose.Schema(
  {
    action: String,
    resource: String,
    userId: mongoose.Types.ObjectId,
    username: String,
    resourseId: mongoose.Types.ObjectId,
    ip: String,
    status: Number,
    success: Boolean,
  },
  { timestamps: true },
);

const AuditLog = mongoose.model("AuditLog", auditLogSchema);

module.exports = AuditLog;
