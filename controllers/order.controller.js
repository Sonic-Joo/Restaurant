const asyncHandler = require("express-async-handler");
const { Order, validateOrder } = require("../models/order");
const { User } = require("../models/user");
const { MenuItem } = require("../models/menu");

/**---------------------------------------------------------------
 * @desc Create Order
 * @router /api/order
 * @method POST
 * @access private (user only)
---------------------------------------------------------------*/
module.exports.createOrder = asyncHandler(async (req, res) => {
  const { error } = validateOrder(req.body);
  if (error) {
    return res.status(400).json({ message: error.details[0].message });
  }

  let totalPrice = 0;
  const orderItems = [];

  for (const item of req.body.items) {
    const menuItem = await MenuItem.findById(item.menuItemId);

    if (!menuItem) {
      return res
        .status(404)
        .json({ message: `Item ${item.menuItemId} Not Found` });
    }

    if (!menuItem.isAvailable) {
      return res
        .status(400)
        .json({ message: `${menuItem.title} is Not Available` });
    }

    const itemPrice = menuItem.price * item.quantity;
    totalPrice += itemPrice;

    orderItems.push({
      menuItemId: item.menuItemId,
      quantity: item.quantity,
      price: itemPrice,
    });
  }

  const order = await Order.create({
    user: req.user.id,
    items: orderItems,
    totalPrice,
    address: req.body.address,
  });

  res.status(201).json(order);
});

/**---------------------------------------------------------------
 * @desc Get All Orders
 * @router /api/order
 * @method GET
 * @access private (admin, chef, delivery)
---------------------------------------------------------------*/
module.exports.getAllOrders = asyncHandler(async (req, res) => {
  const orders = await Order.find()
    .populate("user", "username phoneNumber")
    .populate("items.menuItemId", "title price");
  res.status(200).json(orders);
});

/**---------------------------------------------------------------
 * @desc Get User Orders
 * @router /api/order/myorder
 * @method GET
 * @access private (user only)
---------------------------------------------------------------*/
module.exports.getUserOrders = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user.id).populate("orders");
  if (!user) {
    return res.status(404).json({ message: "User Not Found" });
  }

  res.status(200).json(user.orders);
});

/**---------------------------------------------------------------
 * @desc Update Order Status
 * @router /api/order/:id
 * @method PUT
 * @access private (chef, admin)
---------------------------------------------------------------*/
module.exports.updateOrderState = asyncHandler(async (req, res) => {
  const order = await Order.findById(req.params.id);
  if (!order) {
    return res.status(400).json({ message: "Order Not Found" });
  }

  const { status } = req.body;
  if (!status) {
    return res.status(400).json({ message: "Status is Required" });
  }

  if (status === "ready" || status === "delivered" || status === "cancelled") {
    order.status = status;
    await order.save();
  } else {
    return res.status(400).json({ message: "Invalid Status" });
  }
  res.status(200).json(order);
});

/**---------------------------------------------------------------
 * @desc Cancel Order
 * @router /api/order/:id/cancel
 * @method PUT
 * @access private (user only)
---------------------------------------------------------------*/
module.exports.cancelOrder = asyncHandler(async (req, res) => {
  const order = await Order.findById(req.params.id);
  if (!order) {
    return res.status(404).json({ message: "Order Not Found" });
  }

  if (order.user.toString() !== req.user.id) {
    return res.status(403).json({ message: "Not Allowed" });
  }

  if (order.status !== "pending") {
    return res
      .status(400)
      .json({ message: "Cannot Cancel Order After It's Being Prepared" });
  }

  order.status = "cancelled";
  await order.save();

  res.status(200).json({ message: "Order Cancelled Successfully", order });
});
