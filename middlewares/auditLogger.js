const { Logger } = require("winston");
const AuditLog = require("../models/audit");

const audit = (action, resource) => {
  return (req, res, next) => {
    const originalJson = res.json.bind(res);

    res.json = async (body) => {
      try {
        await AuditLog.create({
          action,
          resource,
          userId: req.user?.id || "guest",
          username: req.user?.username || "guest",
          resourceId: req.params.id || null,
          ip: req.ip,
          status: res.statusCode,
          success: res.statusCode < 400,
        });
      } catch (err) {
        console.error("Audit log failed:", err.message);
        Logger.error("Audit log failed:", err.message);
      }

      return originalJson(body);
    };

    next();
  };
};

module.exports = audit;
