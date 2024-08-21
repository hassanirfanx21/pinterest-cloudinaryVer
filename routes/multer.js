const multer = require("multer");
const { v4: uuidv4 } = require("uuid");
var path = require("path");

// Storage for general uploads
const storageUploads = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "./public/images/uploads");
  },
  filename: function (req, file, cb) {
    const uniquefileName = uuidv4();
    cb(null, uniquefileName + path.extname(file.originalname));
  },
});

// Storage for profile pictures
const storageProfile = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "./public/images/profiles");
  },
  filename: function (req, file, cb) {
    const uniquefileName = uuidv4();
    cb(null, uniquefileName + path.extname(file.originalname));
  },
});

const uploadUploads = multer({ storage: storageUploads });
const uploadProfile = multer({ storage: storageProfile });

module.exports = { uploadUploads, uploadProfile };
