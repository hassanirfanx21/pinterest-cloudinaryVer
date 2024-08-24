const mongoose = require("mongoose");

const postSchema = new mongoose.Schema({
  postText: String,
  image: String, // Cloudinary URL
  image_public_id: String, // Cloudinary public ID
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  likes: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
});

module.exports = mongoose.model("Post", postSchema);
