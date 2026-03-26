const asyncHandler = require("express-async-handler");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const crypto = require("crypto");
const {
  User,
  validationOnRegister,
  validationOnLogin,
  validationOnForgetPass,
} = require("../models/user");
const RefreshToken = require("../models/refreshToken");
const {
  generateTokens,
  generateAccessToken,
} = require("../utils/generateToken");
const verifyEmail = require("../utils/verifyEmail");
const { client } = require("../utils/redisClient");

/**---------------------------------------------------------------
 * @desc Register New User - Sign Up
 * @router /api/auth/register
 * @method POST
 * @access public
  ---------------------------------------------------------------*/
module.exports.registerUserCtrl = asyncHandler(async (req, res) => {
  const { error } = validationOnRegister(req.body);
  if (error) {
    return res.status(400).json({ message: error.details[0].message });
  }

  const userExist = await User.findOne({ email: req.body.email });
  if (userExist) {
    return res.status(400).json({ message: "User Already Exist" });
  }

  const salt = await bcrypt.genSalt(10);
  const password = await bcrypt.hash(req.body.password, salt);

  const verificationToken = crypto.randomBytes(32).toString("hex");
  const user = new User({
    username: req.body.username,
    email: req.body.email,
    password: password,
    address: req.body.address,
    phoneNumber: req.body.phoneNumber,
    verificationToken,
  });
  await user.save();

  const verifyLink = `${process.env.CLIENT_URL}/api/auth/verify/${verificationToken}`;
  const htmlTemplate = `
    <h2>Hello ${user.username}</h2>
    <p>Click the link below to verify your email:</p>
    <a href="${verifyLink}">Verify Email</a>
    <p>Link expires in 24 hours</p>`;
  await verifyEmail(user.email, "Verify Your Email", htmlTemplate);
  await client.del("user-items");

  res.status(201).json({ message: "User Created Successfully, Please Login" });
});

/**---------------------------------------------------------------
 * @desc Login User
 * @router /api/auth/login
 * @method POST
 * @access public
  ---------------------------------------------------------------*/
module.exports.loginCtrl = asyncHandler(async (req, res) => {
  const { error } = validationOnLogin(req.body);
  if (error) {
    return res.status(400).json({ message: error.details[0].message });
  }

  const userExist = await User.findOne({ email: req.body.email }).select(
    "+password",
  );
  if (!userExist) {
    return res.status(400).json({ message: "Email or Password is Incorrect" });
  }

  if (!userExist.isVerified) {
    return res.status(403).json({ message: "Please Verify Your Email" });
  }

  const isValidPass = await bcrypt.compare(
    req.body.password,
    userExist.password,
  );
  if (!isValidPass) {
    return res.status(400).json({ message: "Email or Password is Incorrect" });
  }

  const { accessToken, refreshToken } = await generateTokens(userExist);

  res.status(200).json({
    username: userExist.username,
    email: userExist.email,
    role: userExist.role,
    phoneNumber: userExist.phoneNumber,
    accessToken,
    refreshToken,
  });
});

/**---------------------------------------------------------------
 * @desc Verify Email
 * @router /api/auth/verify:token
 * @method GET
 * @access public
  ---------------------------------------------------------------*/
module.exports.verifyEmailCtrl = asyncHandler(async (req, res) => {
  const user = await User.findOne({ verificationToken: req.params.token });
  if (!user) {
    return res.status(400).json({ message: "Invalid or Expired Token" });
  }

  user.isVerified = true;
  user.verificationToken = null;
  await user.save();

  res.status(200).json({ message: "Email Verified Successfully" });
});

/**---------------------------------------------------------------
 * @desc Forgot Password
 * @router /api/auth/forgot-password
 * @method POST
 * @access public
---------------------------------------------------------------*/
module.exports.forgotPasswordCtrl = asyncHandler(async (req, res) => {
  const { error } = validationOnForgetPass(req.body);
  if (error) {
    return res.status(400).json({ message: error.details[0].message });
  }

  const user = await User.findOne({ email: req.body.email });
  if (!user) {
    return res.status(404).json({ message: "User Not Found" });
  }

  if (!user.isVerified) {
    return res.status(403).json({ message: "Please Verify Your Email First" });
  }

  const resetToken = crypto.randomBytes(32).toString("hex");
  user.resetPasswordToken = resetToken;
  user.resetPasswordExpire = Date.now() + 10 * 60 * 1000;
  await user.save();

  const resetLink = `${process.env.CLIENT_URL}/api/auth/reset-password/${resetToken}`;
  const htmlTemplate = `
    <h2>Hello ${user.username}</h2>
    <p>Click the link below to reset your password:</p>
    <a href="${resetLink}">Reset Password</a>
    <p>Link expires in 10 minutes</p>`;

  await verifyEmail(user.email, "Reset Your Password", htmlTemplate);

  res.status(200).json({ message: "Reset Password Email Sent" });
});

/**---------------------------------------------------------------
 * @desc Reset Password
 * @router /api/auth/reset-password/:token
 * @method POST
 * @access public
---------------------------------------------------------------*/
module.exports.resetPasswordCtrl = asyncHandler(async (req, res) => {
  const user = await User.findOne({
    resetPasswordToken: req.params.token,
  });

  if (!user) {
    return res.status(400).json({ message: "User Not Found" });
  }

  if (user.resetPasswordExpire < Date.now()) {
    return res.status(400).json({ message: "Expired Token, Please Try Again" });
  }

  const newPassword = req.body.newPassword;
  if (newPassword.trim().length < 8) {
    return res
      .status(400)
      .json({ message: "New Password must be at least 8 characters" });
  }

  const salt = await bcrypt.genSalt(10);
  user.password = await bcrypt.hash(req.body.newPassword, salt);

  user.resetPasswordToken = null;
  user.resetPasswordExpire = null;
  await user.save();

  res.status(200).json({ message: "Password Reset Successfully" });
});

/**---------------------------------------------------------------
 * @desc Refresh Access Token
 * @router /api/auth/refresh
 * @method POST
 * @access public
  ---------------------------------------------------------------*/
module.exports.refreshAccessToken = asyncHandler(async (req, res) => {
  const { refreshToken } = req.body;
  if (!refreshToken) {
    return res.status(400).json({ message: "Refresh Token is Required" });
  }

  const storedToken = await RefreshToken.findOne({ token: refreshToken });
  if (!storedToken) {
    return res.status(401).json({ message: "Refresh Token is Not Valid" });
  }

  if (storedToken.expiresAt < new Date()) {
    await RefreshToken.deleteOne({ token: refreshToken });
    return res
      .status(401)
      .json({ message: "Refresh Token is Expired, Please Login Again" });
  }

  const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET_KEY);
  const user = await User.findOne({ _id: decoded.id });

  const accessToken = generateAccessToken(user);

  res.status(200).json({ accessToken });
});

/**---------------------------------------------------------------
 * @desc Logout
 * @router /api/auth/logout
 * @method POST
 * @access public
---------------------------------------------------------------*/
module.exports.logoutCtrl = asyncHandler(async (req, res) => {
  const { refreshToken } = req.body;
  if (!refreshToken) {
    return res.status(400).json({ message: "Refresh Token is Required" });
  }

  const storedToken = await RefreshToken.findOneAndDelete({
    token: refreshToken,
  });
  if (!storedToken) {
    return res.status(401).json({ message: "Refresh Token is Not Valid" });
  }

  res.status(200).json({ message: "Logout Successfully" });
});

/**---------------------------------------------------------------
 * @desc Login with google or facebook (Oauth2)
 * @router /api/auth/google || /api/auth/facebook
 * @method GET
 * @access public
---------------------------------------------------------------*/
module.exports.authCallback = asyncHandler((req, res) => {
  const { user, tokens } = req.user;
  res.status(200).json({
    user,
    accessToken: tokens.accessToken,
    refreshToken: tokens.refreshToken,
  });
});
