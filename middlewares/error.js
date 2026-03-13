const errorHandler = (err, req, res, next) => {
  const statusCode = err.statusCode || 500;
  const message = err.message || "Internal Server Error";

  // Mongoose Validation Error
  if (err.name === "ValidationError") {
    return res.status(400).json({
      message: Object.values(err.errors)
        .map((e) => e.message)
        .join(", "),
    });
  }

  // Mongoose Duplicate Key
  if (err.code === 11000) {
    return res.status(409).json({
      message: `${Object.keys(err.keyValue)} already exists`,
    });
  }

  // Mongoose Invalid ID
  if (err.name === "CastError") {
    return res.status(400).json({
      message: `Invalid ${err.path}: ${err.value}`,
    });
  }

  // JWT Error
  if (err.name === "JsonWebTokenError") {
    return res.status(401).json({ message: "Invalid Token" });
  }

  // JWT Expired
  if (err.name === "TokenExpiredError") {
    return res.status(401).json({ message: "Token Expired" });
  }

  res.status(statusCode).json({ message });
};

module.exports = errorHandler;
