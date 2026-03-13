const asyncHandler = require("express-async-handler");
const bcrypt = require("bcrypt");
const {
  User,
  validationOnUpdate,
  validateChangePassword,
} = require("../models/user");

/**---------------------------------------------------------------
 * @desc Get All Users
 * @router /api/users
 * @method GET
 * @access private (admin only)
---------------------------------------------------------------*/
module.exports.getAllUsersCtrl = asyncHandler(async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  const skip = (page - 1) * limit;

  const total = await User.countDocuments();
  const users = await User.find().skip(skip).limit(limit);

  res.status(200).json({
    total,
    page,
    pages: Math.ceil(total / limit),
    users,
  });
});

/**---------------------------------------------------------------
 * @desc Get User By Id
 * @router /api/users/:id
 * @method GET
 * @access public
---------------------------------------------------------------*/
module.exports.getUserByIdCtrl = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id);
  if (!user) {
    return res.status(404).json({ message: "User Not Found" });
  }
  res.status(200).json(user);
});

/**---------------------------------------------------------------
 * @desc Update User
 * @router /api/user/:id
 * @method PUT
 * @access private (same user only)
---------------------------------------------------------------*/
module.exports.updateUserCtrl = asyncHandler(async (req, res) => {
  const { error } = validationOnUpdate(req.body);
  if (error) {
    return res.status(400).json({ message: error.details[0].message });
  }

  if (req.body.password) {
    const salt = await bcrypt.genSalt(10);
    req.body.password = await bcrypt.hash(req.body.password, salt);
  }

  const user = await User.findById(req.params.id);
  if (!user) {
    return res.status(404).json({ message: "User Not Found" });
  }

  const updated = await User.findByIdAndUpdate(
    req.params.id,
    { $set: req.body },
    { new: true },
  ).select("-password");

  res.status(200).json({ message: "user updated successfully", updated });
});

/**---------------------------------------------------------------
 * @desc Delete User
 * @router /api/users/:id
 * @method DELETE
 * @access private (admin only and user himself)
---------------------------------------------------------------*/
module.exports.deleteUserCtrl = asyncHandler(async (req, res) => {
  const user = await User.findByIdAndDelete(req.params.id);
  if (!user) {
    return res.status(404).json({ message: "User Not Found" });
  }

  res.status(200).json({ message: "User Deleted Successfully" });
});

/**---------------------------------------------------------------
 * @desc Change Password
 * @router /api/users/change-password
 * @method PUT
 * @access private (same user only and admin)
---------------------------------------------------------------*/
module.exports.changePasswordCtrl = asyncHandler(async (req, res) => {
  const { error } = validateChangePassword(req.body);
  if (error) {
    return res.status(400).json({ message: error.details[0].message });
  }

  const user = await User.findById(req.user.id).select("+password");
  if (!user) {
    return res.status(404).json({ message: "User Not Found" });
  }

  const isMatch = await bcrypt.compare(req.body.oldPassword, user.password);
  if (!isMatch) {
    return res.status(400).json({ message: "Old Password is Incorrect" });
  }

  const salt = await bcrypt.genSalt(10);
  user.password = await bcrypt.hash(req.body.newPassword, salt);
  await user.save();

  res.status(200).json({ message: "Password Changed Successfully" });
});

/**---------------------------------------------------------------
 * @desc Change User Role
 * @router /api/user/:id/role
 * @method PUT
 * @access private (admin only)
---------------------------------------------------------------*/
module.exports.changeUserRole = asyncHandler(async (req, res) => {
  const { role } = req.body;
  if (!role) {
    return res.status(400).json({ message: "Role is Required" });
  }
  if (!["user", "admin", "chef", "delivery"].includes(role)) {
    return res.status(400).json({ message: "Invalid Role" });
  }

  const user = await User.findById(req.params.id);
  if (!user) {
    return res.status(404).json({ message: "User Not Found" });
  }

  user.role = role;
  await user.save();

  res.status(200).json(user);
});
