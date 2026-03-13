const router = require("express").Router();
const {
  createOrder,
  getAllOrders,
  getUserOrders,
  updateOrderState,
  cancelOrder,
} = require("../controllers/order.controller");
const {
  verifyToken,
  verifyTokenAndStaff,
  verifyTokenAndChef,
} = require("../middlewares/verifyToken");

router
  .route("/")
  .post(verifyToken, createOrder)
  .get(verifyTokenAndStaff, getAllOrders);

router.route("/myorder").get(verifyToken, getUserOrders);
router.route("/:id").put(verifyTokenAndChef, updateOrderState);

router.route("/:id/cancel").put(verifyToken, cancelOrder);

module.exports = router;
