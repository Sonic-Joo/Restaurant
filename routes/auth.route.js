const router = require("express").Router();
const passport = require("passport");
const {
  loginCtrl,
  logoutCtrl,
  registerUserCtrl,
  verifyEmailCtrl,
  forgotPasswordCtrl,
  resetPasswordCtrl,
  refreshAccessToken,
  authCallback,
} = require("../controllers/auth.controller");

router.route("/register").post(registerUserCtrl);

router.route("/login").post(loginCtrl);

router.route("/refresh").post(refreshAccessToken);

router.get("/verify/:token", verifyEmailCtrl);

router.post("/forgot-password", forgotPasswordCtrl);

router.post("/reset-password/:token", resetPasswordCtrl);

router.route("/logout").get(logoutCtrl);

router
  .route("/google")
  .get(passport.authenticate("google", { scope: ["profile", "email"] }));

router.route("/google/callback").get(
  passport.authenticate("google", {
    failureRedirect: "/api/auth/google/failed",
  }),
  authCallback,
);

router.route("/google/failed").get((req, res) => {
  res.status(400).json({ message: "Google Login Failed" });
});

router
  .route("/facebook")
  .get(passport.authenticate("facebook", { scope: ["email"] }));

router.route("/facebook/callback").get(
  passport.authenticate("facebook", {
    failureRedirect: "/api/auth/facebook/failed",
  }),
  authCallback,
);

router.route("/facebook/failed").get((req, res) => {
  res.status(400).json({ message: "Facebook Login Failed" });
});

module.exports = router;
