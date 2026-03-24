const router = require("express").Router();
const uploadPhoto = require("../middlewares/photoUpload");
const auditLogger = require("../middlewares/auditLogger");
const { verifyTokenAndChef } = require("../middlewares/verifyToken");
const {
  createMenuItem,
  getAllMenuItems,
  getMenuItemById,
  updateMenuItem,
  deleteMenuItem,
  updateMenuItemImage,
  searchMenuItem,
} = require("../controllers/menu.controller");
const cache = require("../middlewares/cache");

const cacheMenuItemsIfDefault = (req, res, next) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;

  if (page === 1 && limit === 10) {
    return cache("menu-items", 60 * 60 * 12)(req, res, next);
  }

  return next();
};

router
  .route("/")
  .get(cacheMenuItemsIfDefault, getAllMenuItems)
  .post(
    verifyTokenAndChef,
    auditLogger("Create MenuItem", "MenuItem"),
    uploadPhoto.array("images", 5),
    createMenuItem,
  );

router.route("/search").get(searchMenuItem);

router
  .route("/:id")
  .get(getMenuItemById)
  .put(
    verifyTokenAndChef,
    auditLogger("Update MenuItem", "MenuItem"),
    updateMenuItem,
  )
  .delete(
    verifyTokenAndChef,
    auditLogger("Delete MenuItem", "MenuItem"),
    deleteMenuItem,
  );

router
  .route("/:id/image")
  .put(
    verifyTokenAndChef,
    auditLogger("Update MenuItemImage", "MenuItem"),
    uploadPhoto.array("images", 5),
    updateMenuItemImage,
  );

module.exports = router;
