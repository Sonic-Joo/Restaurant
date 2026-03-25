const mongoose = require("mongoose");
const joi = require("joi");

const userSchema = new mongoose.Schema(
  {
    username: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
    },
    password: {
      type: String,
      minlength: 8,
      select: false,
    },
    phoneNumber: {
      type: String,
      trim: true,
    },
    role: {
      type: String,
      default: "user",
      enum: ["user", "admin", "chef", "delivery"],
    },
    address: {
      type: String,
      trim: true,
    },
    isVerified: {
      type: Boolean,
      default: false,
    },
    googleId: {
      type: String,
      default: null,
      select: false,
    },
    facebookId: {
      type: String,
      default: null,
      select: false,
    },
    verificationToken: {
      type: String,
      default: null,
    },
    resetPasswordToken: {
      type: String,
      default: null,
    },
    resetPasswordExpire: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
    toJSON: {
      virtuals: true,
      transform: (doc, ret) => {
        delete ret._id;
        delete ret.__v;
        return ret;
      },
    },
    toObject: { virtuals: true },
  },
);

userSchema.virtual("orders", {
  ref: "Order",
  foreignField: "user",
  localField: "_id",
});

const validationOnRegister = (obj) => {
  const schema = joi.object({
    username: joi.string().trim().required(),
    address: joi.string().trim().required(),
    email: joi.string().trim().email().required(),
    password: joi.string().min(8).required(),
    phoneNumber: joi
      .string()
      .pattern(/^[0-9]{11}$/)
      .required(),
  });
  return schema.validate(obj);
};

const validationOnLogin = (obj) => {
  const schema = joi.object({
    email: joi.string().email().trim().required(),
    password: joi.string().min(8).required(),
  });
  return schema.validate(obj);
};

const validationOnForgetPass = (obj) => {
  const schema = joi.object({
    email: joi.string().email().trim().required(),
  });
  return schema.validate(obj);
};

const validationOnUpdate = (obj) => {
  const schema = joi.object({
    username: joi.string().trim().optional(),
    address: joi.string().trim().optional(),
    password: joi.string().min(8).optional(),
    phoneNumber: joi
      .string()
      .pattern(/^[0-9]{11}$/)
      .optional(),
  });
  return schema.validate(obj);
};

const validateChangePassword = (obj) => {
  const schema = joi.object({
    oldPassword: joi.string().min(8).required(),
    newPassword: joi.string().min(8).required(),
  });
  return schema.validate(obj);
};

const User = mongoose.model("User", userSchema);

module.exports = {
  User,
  validationOnRegister,
  validationOnLogin,
  validationOnForgetPass,
  validationOnUpdate,
  validateChangePassword,
};
