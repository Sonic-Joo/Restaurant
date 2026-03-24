const router = require("express").Router();
const auditLogger = require("../middlewares/auditLogger");
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
const cache = require("../middlewares/cache");

router
  .route("/")
  .post(verifyToken, auditLogger("Create Order", "Order"), createOrder)
  .get(verifyTokenAndStaff, cache("order-items"), getAllOrders);

router.route("/myorder").get(verifyToken, getUserOrders);
router
  .route("/:id")
  .put(
    verifyTokenAndChef,
    auditLogger("Update Order", "Order"),
    updateOrderState,
  );

router
  .route("/:id/cancel")
  .put(verifyToken, auditLogger("Delete Order", "Order"), cancelOrder);

module.exports = router;
