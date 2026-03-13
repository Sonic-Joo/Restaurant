const router = require("express").Router();
const {
  loginCtrl,
  registerUserCtrl,
  verifyEmailCtrl,
  forgotPasswordCtrl,
  resetPasswordCtrl,
} = require("../controllers/auth.controller");

router.route("/register").post(registerUserCtrl);

router.route("/login").post(loginCtrl);

router.get("/verify/:token", verifyEmailCtrl);

router.post("/forgot-password", forgotPasswordCtrl);

router.post("/reset-password/:token", resetPasswordCtrl);

module.exports = router;
