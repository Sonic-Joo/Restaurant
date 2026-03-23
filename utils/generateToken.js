const jwt = require("jsonwebtoken");
const RefreshToken = require("../models/refreshToken");

const generateTokens = async (user) => {
  const accessToken = jwt.sign(
    { id: user._id, role: user.role, username: user.username },
    process.env.JWT_SECRET_KEY,
    { expiresIn: "15m" },
  );

  const refreshToken = jwt.sign(
    { id: user._id },
    process.env.JWT_REFRESH_SECRET_KEY,
    { expiresIn: "7d" },
  );

  await RefreshToken.findOneAndDelete({ user: user._id });

  await RefreshToken.create({
    token: refreshToken,
    user: user._id,
    expiresAt: new Date(Date.now() + 1000 * 60 * 60 * 24 * 7),
  });

  return { accessToken, refreshToken };
};

const generateAccessToken = (user) => {
  const accessToken = jwt.sign(
    { id: user._id, role: user.role, username: user.username },
    process.env.JWT_SECRET_KEY,
    { expiresIn: "15m" },
  );

  return accessToken;
};

module.exports = { generateTokens, generateAccessToken };
