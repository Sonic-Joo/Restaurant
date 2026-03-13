const router = require("express").Router();
const uploadPhoto = require("../middlewares/photoUpload");
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

router
  .route("/")
  .post(verifyTokenAndChef, uploadPhoto.array("images", 5), createMenuItem)
  .get(getAllMenuItems);

router.route("/search").get(searchMenuItem);

router
  .route("/:id")
  .get(getMenuItemById)
  .put(verifyTokenAndChef, updateMenuItem)
  .delete(verifyTokenAndChef, deleteMenuItem);

router
  .route("/:id/image")
  .put(verifyTokenAndChef, uploadPhoto.array("images", 5), updateMenuItemImage);

module.exports = router;
