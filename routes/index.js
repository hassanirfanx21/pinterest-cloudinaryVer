var express = require("express");
var router = express.Router();
const cloudinary = require("../config/cloudinaryConfig"); // Import Cloudinary's v2 API
const mongoose = require("mongoose");
const passport = require("passport");
const userModel = require("./users"); // Updated path
const postModel = require("./posts"); // Updated path
const localStrategy = require("passport-local");
const { uploadProfile, uploadPost } = require("./multer");

// Configure Passport
passport.use(new localStrategy(userModel.authenticate()));

// Routes
router.get("/", function (req, res, next) {
  res.redirect("/login");
});

router.get("/signup", function (req, res, next) {
  res.render("signup");
});

router.get("/login", function (req, res, next) {
  const flash = req.flash("error");
  res.render("login", { flash: flash });
});

router.get("/userPosts", isLoggedIn, async function (req, res) {
  const user = await userModel.findOne({
    username: req.session.passport.user,
  });
  res.render("userPosts", { user: user });
});

// Delete post route (updated to handle Cloudinary URLs)
router.delete("/deletePost/:postId", isLoggedIn, async function (req, res) {
  const user = await userModel.findOne({
    username: req.session.passport.user,
  });
  const post = await postModel.findOne({ _id: req.params.postId });
  const post_index = user.posts.indexOf(req.params.postId);
  user.posts.splice(post_index, 1);
  await user.save();

  // Delete post document from MongoDB
  await postModel.deleteOne({ _id: req.params.postId });

  // Delete image from Cloudinary
  cloudinary.uploader.destroy(post.image_public_id, function (error, result) {
    if (error) {
      console.error("Error deleting the file from Cloudinary:", error);
      return res.status(500).send("Error deleting the file from Cloudinary");
    }
    console.log("File deleted successfully from Cloudinary");
    res.status(200).send("Post deleted successfully");
  });
});

router.get("/feed", isLoggedIn, async function (req, res) {
  res.render("feed");
});

router.get("/api/userPosts", isLoggedIn, async function (req, res, next) {
  try {
    const user = await userModel.findOne({
      username: req.session.passport.user,
    });
    const posts = await postModel.find({ user: user._id });
    res.json(posts); // Send posts data as JSON
  } catch (err) {
    next(err);
  }
});

router.get("/api/user", isLoggedIn, async function (req, res, next) {
  try {
    const user = await userModel.findOne({
      username: req.session.passport.user,
    });
    res.json(user); // Send user data as JSON
  } catch (err) {
    next(err);
  }
});

router.get("/api/feed", isLoggedIn, async function (req, res, next) {
  try {
    const allposts = await postModel.find();
    res.json(allposts.reverse()); // Send posts data as JSON
  } catch (err) {
    next(err);
  }
});

router.get("/api/likes/:postId", isLoggedIn, async function (req, res) {
  const post = await postModel.findOne({ _id: req.params.postId });
  const user = await userModel.findOne({
    username: req.session.passport.user,
  });
  if (post.likes.indexOf(user._id) != -1) {
    post.likes.splice(post.likes.indexOf(user._id), 1);
  } else {
    post.likes.push(user._id);
  }
  await post.save();
  res.redirect("/feed");
});

router.get("/profile", isLoggedIn, async function (req, res, next) {
  try {
    const user = await userModel.findOne({
      username: req.session.passport.user,
    });
    const flash = req.flash("error");
    res.render("profile", { user: user, flash: flash });
  } catch (err) {
    return next(err);
  }
});

router.post(
  "/upload",
  isLoggedIn,
  uploadPost.single("file"),
  async function (req, res, next) {
    if (!req.file) {
      req.flash("error", "No file selected or upload failed.");
      return res.redirect("/profile");
    }

    const user = await userModel.findOne({
      username: req.session.passport.user,
    });

    var postdata = new postModel({
      postText: "hello",
      image: req.file.path, // Cloudinary URL
      image_public_id: req.file.filename, // Cloudinary public ID
      user: user._id,
    });

    await postdata.save();
    user.posts.push(postdata._id);
    await user.save();

    res.redirect("/profile");
  }
);

router.post(
  "/profileDp",
  isLoggedIn,
  uploadProfile.single("profilePic"),
  async function (req, res, next) {
    if (!req.file) {
      return res.status(400).send("No files were uploaded.");
    }

    const user = await userModel.findOne({
      username: req.session.passport.user,
    });

    // Check if the user already has a profile picture
    if (
      user.dp[0] !==
      "https://res.cloudinary.com/dy20mrrq9/image/upload/v1724502194/default-profile_ynrx8i.png"
    ) {
      // Extract public_id from the existing profile picture URL
      const oldPublicId = user.dp[0].split("/")
        .splice(-2)
        .join("/")
        .split(".")[0];

      // Delete the old profile picture from Cloudinary
      cloudinary.uploader.destroy(oldPublicId, function (error, result) {
        if (error) {
          console.error("Error deleting the old file from Cloudinary:", error);
        } else {
          console.log("Old file deleted successfully from Cloudinary:", result);
        }
      });
    }

    // Update user profile picture
    user.dp = [req.file.path]; // Save the new profile picture URL

    await user.save();

    res.redirect("/profile");
  }
);

router.post("/signup", function (req, res) {
  var userdata = new userModel({
    username: req.body.username,
    email: req.body.email,
    fullname: req.body.fullname,
    dp: [
      "https://res.cloudinary.com/dy20mrrq9/image/upload/v1724502194/default-profile_ynrx8i.png",
    ], // Default profile picture
  });
  userModel
    .register(userdata, req.body.password)
    .then(function (registeredUser) {
      passport.authenticate("local")(req, res, function () {
        res.redirect("/profile");
      });
    })
    .catch(function (err) {
      res.redirect("/login"); // Handle errors, e.g., user already exists
    });
});

router.post(
  "/login",
  passport.authenticate("local", {
    successRedirect: "/profile",
    failureRedirect: "/login",
    failureFlash: true,
  }),
  function (req, res) {}
);

router.get("/logout", isLoggedIn, function (req, res, next) {
  req.logout(function (err) {
    if (err) {
      return next(err);
    }
    res.redirect("/");
  });
});

function isLoggedIn(req, res, next) {
  if (req.isAuthenticated()) {
    return next();
  }
  res.redirect("/");
}

router.use(function (err, req, res, next) {
  console.error(err.stack);
  res.status(500).send("Something went wrong!");
});

module.exports = router;
