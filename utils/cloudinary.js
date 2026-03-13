const cloudinary = require("cloudinary").v2;

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const cloudinaryUploadImage = (buffer) => {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      { folder: "restaurant/menu", resource_type: "image" },
      (error, result) => {
        if (error) reject(error);
        else resolve(result);
      },
    );
    stream.end(buffer);
  });
};

const cloudinaryDeleteMultiImage = async (imagePublicIds) => {
  try {
    const result = await cloudinary.api.delete_resources(imagePublicIds);
    return result;
  } catch (error) {
    throw new Error(error.message || "Cloudinary Upload Error");
  }
};

module.exports = {
  cloudinaryUploadImage,
  cloudinaryDeleteMultiImage,
};
