const jwt = require("jsonwebtoken");

const verifyToken = (req, res, next) => {
  const headers = req.headers.authorization || req.headers.Authorization;

  if (!headers || !headers.startsWith("Bearer ")) {
    return res
      .status(401)
      .json({ message: "Token is Required, Access Denied" });
  }

  const token = headers.split(" ")[1];

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET_KEY);
    req.user = decoded;
    next();
  } catch {
    return res.status(401).json({ message: "Invalid Token, Access Denied" });
  }
};

const verifyTokenAndAdmin = (req, res, next) => {
  verifyToken(req, res, () => {
    if (req.user.role === "admin") {
      next();
    } else {
      return res.status(403).json({ message: "Not Allowed, Only Admin" });
    }
  });
};

const verifyTokenAndUser = (req, res, next) => {
  verifyToken(req, res, () => {
    if (req.user.id === req.params.id || req.user.role === "admin") {
      next();
    } else {
      return res
        .status(403)
        .json({ message: "Not Allowed, Only Admin Or User Himself" });
    }
  });
};

const verifyTokenAndChef = (req, res, next) => {
  verifyToken(req, res, () => {
    if (req.user.role === "chef" || req.user.role === "admin") {
      next();
    } else {
      return res
        .status(403)
        .json({ message: "Not Allowed, Only Chef Or Admin" });
    }
  });
};

const verifyTokenAndDelivery = (req, res, next) => {
  verifyToken(req, res, () => {
    if (req.user.role === "delivery" || req.user.role === "admin")
      next();
    else {
      return res
        .status(403)
        .json({ message: "Not Allowed, Only Delivery Or Admin" });
    }
  });
};

const verifyTokenAndStaff = (req, res, next) => {
  verifyToken(req, res, () => {
    if (
      req.user.role === "admin" ||
      req.user.role === "chef" ||
      req.user.role === "delivery"
    ) {
      next();
    }
    return res.status(403).json({ message: "Not Allowed, Staff Only" });
  });
};

module.exports = {
  verifyToken,
  verifyTokenAndUser,
  verifyTokenAndAdmin,
  verifyTokenAndChef,
  verifyTokenAndDelivery,
  verifyTokenAndStaff,
};
