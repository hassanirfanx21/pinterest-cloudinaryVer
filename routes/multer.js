const multer = require("multer");
const { CloudinaryStorage } = require("multer-storage-cloudinary");
const cloudinary = require("../config/cloudinaryConfig");

// Configure Cloudinary Storage for profiles and posts
const profileStorage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: "profiles", // Cloudinary folder for profile images
    allowedFormats: ["jpg", "jpeg", "png"],
  },
});

const postStorage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: "posts", // Cloudinary folder for post images
    allowedFormats: ["jpg", "jpeg", "png"],
  },
});

// Create Multer upload instances
const uploadProfile = multer({ storage: profileStorage });
const uploadPost = multer({ storage: postStorage });

module.exports = { uploadProfile, uploadPost };
