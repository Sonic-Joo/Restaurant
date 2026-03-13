const router = require("express").Router();
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

router.get("/", verifyTokenAndAdmin, getAllUsersCtrl);
router.put("/change-password", verifyToken, changePasswordCtrl);
router.get("/:id", verifyToken, getUserByIdCtrl);
router.put("/:id", verifyTokenAndUser, updateUserCtrl);
router.put("/:id/role", verifyTokenAndAdmin, changeUserRole);
router.delete("/:id", verifyTokenAndUser, deleteUserCtrl);

module.exports = router;
