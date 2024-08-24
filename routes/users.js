const mongoose = require("mongoose");
const plm = require("passport-local-mongoose");

// Define the User schema
const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    unique: true,
  },
  fullname: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
  },
  password: {
    type: String,
  },
  dp: [
    {
      type: String,
      default: "default-profile_ynrx8i", // Cloudinary public ID
    },
  ],
  posts: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Post",
    },
  ],
});

userSchema.plugin(plm);

const User = mongoose.model("User", userSchema);

module.exports = User;
