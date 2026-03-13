const mongoose = require("mongoose");
const joi = require("joi");

const menuItemSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
      unique: true,
    },
    description: {
      type: String,
      required: true,
      trim: true,
    },
    price: {
      type: Number,
      required: true,
      min: 0,
    },
    images: [
      {
        url: { type: String, required: true },
        publicID: { type: String, required: true },
      },
    ],
    category: {
      type: String,
      trim: true,
      required: true,
      enum: ["grills", "drinks", "desserts", "sandwiches"],
    },
    isAvailable: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  },
);

const MenuItem = mongoose.model("MenuItem", menuItemSchema);

const validateCreateMenuItem = (obj) => {
  const schema = joi.object({
    title: joi.string().trim().required(),
    description: joi.string().trim().required(),
    price: joi.number().min(0).required(),
    category: joi
      .string()
      .trim()
      .valid("grills", "drinks", "desserts", "sandwiches")
      .required(),
    isAvailable: joi.boolean().optional(),
  });
  return schema.validate(obj);
};

const validateUpdateMenuItem = (obj) => {
  const schema = joi.object({
    title: joi.string().trim().optional(),
    description: joi.string().trim().optional(),
    price: joi.number().min(0).optional(),
    category: joi
      .string()
      .trim()
      .valid("grills", "drinks", "desserts", "sandwiches")
      .optional(),
    isAvailable: joi.boolean().optional(),
  });
  return schema.validate(obj);
};

module.exports = {
  MenuItem,
  validateCreateMenuItem,
  validateUpdateMenuItem,
};
