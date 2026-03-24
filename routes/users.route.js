const router = require("express").Router();
const auditLogger = require("../middlewares/auditLogger");
const {
  getAllUsersCtrl,
  getUserByIdCtrl,
  updateUserCtrl,
  deleteUserCtrl,
  changePasswordCtrl,
  changeUserRole,
} = require("../controllers/users.controller");
const {
  verifyToken,
  verifyTokenAndAdmin,
  verifyTokenAndUser,
} = require("../middlewares/verifyToken");
const { cacheWithPagenation } = require("../middlewares/cache");

router.get(
  "/",
  verifyTokenAndAdmin,
  cacheWithPagenation("user-items", 60 * 60 * 12),
  getAllUsersCtrl,
);

router.put("/change-password", verifyToken, changePasswordCtrl);

router.get("/:id", verifyToken, getUserByIdCtrl);

router.put(
  "/:id",
  verifyTokenAndUser,
  auditLogger("Update User", "User"),
  updateUserCtrl,
);

router.put(
  "/:id/role",
  verifyTokenAndAdmin,
  auditLogger("Update User Role", "User"),
  changeUserRole,
);

router.delete(
  "/:id",
  verifyTokenAndUser,
  auditLogger("Delete User", "User"),
  deleteUserCtrl,
);

module.exports = router;
