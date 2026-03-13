const mongoose = require("mongoose");
const joi = require("joi");

const orderSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    items: [
      {
        menuItemId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "MenuItem",
          required: true,
        },
        quantity: {
          type: Number,
          required: true,
          min: 1,
        },
        price: {
          type: Number,
          required: true,
        },
      },
    ],
    totalPrice: {
      type: Number,
      required: true,
    },
    status: {
      type: String,
      enum: ["pending", "ready", "delivered", "cancelled"],
      default: "pending",
    },
    address: {
      type: String,
      required: true,
    },
  },
  { timestamps: true },
);

const validateOrder = (obj) => {
  const schema = joi.object({
    items: joi
      .array()
      .items(
        joi.object({
          menuItemId: joi.string().required(),
          quantity: joi.number().min(1).required(),
        }),
      )
      .min(1)
      .required(),
    address: joi.string().required(),
  });
  return schema.validate(obj);
};

const Order = mongoose.model("Order", orderSchema);

module.exports = {
  Order,
  validateOrder,
};
