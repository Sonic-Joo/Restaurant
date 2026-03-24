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
const cache = require("../middlewares/cache");

const cacheUserItemsIfDefault = (req, res, next) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;

  if (page === 1 && limit === 10) {
    return cache("user-items", 60 * 60 * 12)(req, res, next);
  }

  return next();
};

router.get("/", verifyTokenAndAdmin, cacheUserItemsIfDefault, getAllUsersCtrl);

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
