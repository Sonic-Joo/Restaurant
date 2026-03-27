const asyncHandler = require("express-async-handler");
const {
  MenuItem,
  validateCreateMenuItem,
  validateUpdateMenuItem,
} = require("../models/menu");
const {
  cloudinaryUploadImage,
  cloudinaryDeleteMultiImage,
} = require("../utils/cloudinary");
const { client } = require("../utils/redisClient");

/**---------------------------------------------------------------
 * @desc Create New Item 
 * @router /api/menu
 * @method POST
 * @access private (only admin or chef)
  ---------------------------------------------------------------*/
module.exports.createMenuItem = asyncHandler(async (req, res) => {
  const { error } = validateCreateMenuItem(req.body);
  if (error) {
    return res.status(400).json({ message: error.details[0].message });
  }

  const itemExist = await MenuItem.findOne({ title: req.body.title });
  if (itemExist) {
    return res.status(409).json({ message: "Item Already Exist" });
  }

  const images = [];
  if (req.files && req.files.length > 0) {
    for (const file of req.files) {
      const result = await cloudinaryUploadImage(file.buffer);
      images.push({
        url: result.secure_url,
        publicID: result.public_id,
      });
    }
  }

  const item = await MenuItem.create({ ...req.body, images });
  await client.del("menu-items");

  res.status(201).json(item);
});

/**---------------------------------------------------------------
 * @desc Get All Menu Items
 * @router /api/menu
 * @method GET
 * @access public
---------------------------------------------------------------*/
module.exports.getAllMenuItems = asyncHandler(async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  const skip = (page - 1) * limit;

  const total = await MenuItem.countDocuments();
  const items = await MenuItem.find().skip(skip).limit(limit);

  res.status(200).json({
    total,
    page,
    pages: Math.ceil(total / limit),
    items,
  });
});

/**---------------------------------------------------------------
 * @desc Get Menu Item By Id
 * @router /api/menu/:id
 * @method GET
 * @access public
---------------------------------------------------------------*/
module.exports.getMenuItemById = asyncHandler(async (req, res) => {
  const item = await MenuItem.findById(req.params.id);
  if (!item) {
    return res.status(404).json({ message: "Item Not Found" });
  }
  res.status(200).json(item);
});

/**---------------------------------------------------------------
 * @desc Update Menu Item 
 * @router /api/menu/:id
 * @method PUT
 * @access private (only admin and chef)
---------------------------------------------------------------*/
module.exports.updateMenuItem = asyncHandler(async (req, res) => {
  const { error } = validateUpdateMenuItem(req.body);
  if (error) {
    return res.status(400).json({ message: error.details[0].message });
  }

  const item = await MenuItem.findById(req.params.id);
  if (!item) {
    return res.status(404).json({ message: "Item Not Found" });
  }

  const updated = await MenuItem.findByIdAndUpdate(
    req.params.id,
    {
      $set: {
        ...req.body,
      },
    },
    { new: true },
  );
  await client.del("menu-items");

  res.status(200).json(updated);
});

/**---------------------------------------------------------------
 * @desc Updater Menu Item Image
 * @router /api/menu/:id/image
 * @method Update
 * @access private (only admin and chef)
---------------------------------------------------------------*/
module.exports.updateMenuItemImage = asyncHandler(async (req, res) => {
  if (!req.files || req.files.length === 0) {
    return res.status(400).json({ message: "No Image Provided" });
  }

  const itemExist = await MenuItem.findById(req.params.id);
  if (!itemExist) {
    return res.status(404).json({ message: "Item Not Found" });
  }

  const publicIds = itemExist.images.map((img) => img.publicID);
  if (publicIds.length > 0) await cloudinaryDeleteMultiImage(publicIds);

  const images = [];
  for (const file of req.files) {
    const result = await cloudinaryUploadImage(file.buffer);
    images.push({
      url: result.secure_url,
      publicID: result.public_id,
    });
  }

  itemExist.images = images;
  await itemExist.save();
  await client.del("menu-items");

  res.status(200).json({ item: itemExist });
});

/**---------------------------------------------------------------
 * @desc Search in Menu Item
 * @router /api/menu/search
 * @method GET
 * @access public
---------------------------------------------------------------*/
const validCategories = ["grills", "drinks", "desserts", "sandwiches"];
module.exports.searchMenuItem = asyncHandler(async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  const skip = (page - 1) * limit;

  const query = {};

  if (req.query.title) {
    query.title = new RegExp(req.query.title.trim(), "i");
  }

  if (req.query.category) {
    const cat = req.query.category.trim().toLowerCase();

    if (!validCategories.has(cat)) {
      return res.status(400).json({ message: "Invalid Category" });
    }

    query.category = cat;
  }

  const total = await MenuItem.countDocuments(query);
  const items = await MenuItem.find(query).skip(skip).limit(limit);

  res.status(200).json({
    total,
    page,
    pages: Math.ceil(total / limit),
    items,
  });
});

/**---------------------------------------------------------------
 * @desc Delete Menu Item
 * @router /api/menu/:id
 * @method DELETE
 * @access private (only admin and chef)
---------------------------------------------------------------*/
module.exports.deleteMenuItem = asyncHandler(async (req, res) => {
  const menuItem = await MenuItem.findById(req.params.id);
  if (!menuItem) {
    return res.status(404).json({ message: "Item Not Found" });
  }

  const publicIds = menuItem.images.map((img) => img.publicID);
  if (publicIds.length > 0) await cloudinaryDeleteMultiImage(publicIds);

  const deleted = await MenuItem.findByIdAndDelete(req.params.id);
  await client.del("menu-items");

  res.status(200).json(deleted);
});
