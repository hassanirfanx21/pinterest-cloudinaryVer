var express = require("express");
var router = express.Router();
const mongoose = require("mongoose");
const path = require("path");
const fs = require("fs");

const passport = require("passport");
const userModel = require("./users");
const postModel = require("./posts");
const localStrategy = require("passport-local");
const { uploadUploads, uploadProfile } = require("./multer");

passport.use(new localStrategy(userModel.authenticate()));

//  "/" to login page
router.get("/", function (req, res, next) {
  res.redirect("/login");
});
//signup page
router.get("/signup", function (req, res, next) {
  res.render("signup");
});
//login page
router.get("/login", function (req, res, next) {
  const flash = req.flash("error");
  res.render("login", { flash: flash });
});
//userposts page
router.get("/userPosts", isLoggedIn, async function (req, res) {
  const user = await userModel.findOne({
    username: req.session.passport.user,
  });
  res.render("userPosts", { user: user });
});
//this route will delete post from database and file from uploads
router.delete("/deletePost/:postId", isLoggedIn, async function (req, res) {
  const user = await userModel.findOne({
    username: req.session.passport.user,
  });
  const post = await postModel.findOne({ _id: req.params.postId });
  const post_index = user.posts.indexOf(req.params.postId);
  user.posts.splice(post_index, 1);
  await user.save();
  console.log(post); //post about to be deleted
  let post_image = post.image;
  const del = await postModel.deleteOne({
    _id: req.params.postId,
  });
  // ".." in order to move out of dir
  const filePath = path.join(
    __dirname,
    "..",
    "public",
    "images",
    "uploads",
    `${post_image}`
  );
  //deletes file by using path
  fs.unlink(filePath, (err) => {
    if (err) {
      console.error("Error deleting the file:", err);
      return res.status(500).send("Error deleting the file");
    }
    console.log("File deleted successfully");
    res.status(200).send("Post deleted successfully");
  });
});
//feed page
router.get("/feed", isLoggedIn, async function (req, res) {
  res.render("feed");
});
//api userposts
router.get("/api/userPosts", isLoggedIn, async function (req, res, next) {
  try {
    const user = await userModel.findOne({
      username: req.session.passport.user,
    });

    const posts = await postModel.find({
      user: user._id,
    });
    res.json(posts); // Send posts data as JSON
  } catch (err) {
    next(err); // Handle errors
  }
});
//api user
router.get("/api/user", isLoggedIn, async function (req, res, next) {
  try {
    const user = await userModel.findOne({
      username: req.session.passport.user,
    });

    res.json(user); // Send posts data as JSON
  } catch (err) {
    next(err); // Handle errors
  }
});
// API feed route
router.get("/api/feed", isLoggedIn, async function (req, res, next) {
  try {
    // const allUser = await userModel.find();
    let allposts = await postModel.find();

    // for (const user of allUser) {
    //   const posts = await postModel.find({ user: user._id });
    //   allposts = allposts.concat(posts);
    // }

    res.json(allposts.reverse()); // Send posts data as JSON
  } catch (err) {
    next(err); // Handle errors
  }
});
//api LIKES
router.get("/api/likes/:postId", isLoggedIn, async function (req, res) {
  const post = await postModel.findOne({ _id: req.params.postId });
  const user = await userModel.findOne({
    username: req.session.passport.user,
  });
  //if logged in user liked a post which he already liked then the name of that user in likes array will bre removed
  if (post.likes.indexOf(user._id) != -1) {
    post.likes.splice(post.likes.indexOf(user._id), 1);
  } else {
    post.likes.push(user._id);
  }
  await post.save();
  console.log("HELLO", post);
  res.redirect("/feed");
});
//  GET profile page.
router.get("/profile", isLoggedIn, async function (req, res, next) {
  try {
    const user = await userModel.findOne({
      username: req.session.passport.user,
    });
    console.log(user.fullname); // Log the full name
    const flash = req.flash("error");
    res.render("profile", { user: user, flash: flash }); // Pass the user object to the template
  } catch (err) {
    return next(err); // Handle errors
  }
});
//upload post request
let lastUploadedFile = null;
router.post(
  "/upload",
  isLoggedIn,
  uploadUploads.single("file"),
  async function (req, res, next) {
    if (!req.file) {
      const flash = req.flash("error", "No file selected or upload failed.");
      return res.redirect("/profile");
    }

    const user = await userModel.findOne({
      username: req.session.passport.user,
    });

    // Compare new file with the last uploaded file
    if (lastUploadedFile === req.file.filename) {
      req.flash("info", "This file is already uploaded.");
      return res.redirect("/profisle");
    }

    // Save new file info
    lastUploadedFile = req.file.filename;
    console.log("this is uploaded file", lastUploadedFile); //if fie exists then it gives filename otherwise undefined
    var postdata = new postModel({
      postText: "promaxnigga69",
      image: req.file.filename,
      user: user._id,
    });

    postdata.save();
    user.posts.push(postdata._id);
    user.save();
    res.redirect("/profile");
  }
);

//profile upload post request
router.post(
  "/profileDp",
  isLoggedIn,
  uploadProfile.single("profilePic"),
  async function (req, res, next) {
    if (!req.file) {
      return res.status(400).send("No files were uploaded on pfp.");
    }
    const user = await userModel.findOne({
      username: req.session.passport.user,
    });
    const filePath = path.join(
      __dirname,
      "..",
      "public",
      "images",
      "profiles",
      `${user.dp[0]}`
    );
    if (user.dp[0] != "default-profile.png") {
      fs.unlink(filePath, (err) => {
        if (err) {
          console.error("Error deleting the  previous profile:", err);
          return res.status(500).send("Error deleting the  previous profile");
        }
        console.log("File deleted successfully");
      });
    } //deletes file by using path
    user.dp.pop(); //this will remove previous dp at index 0
    user.dp.push(req.file.filename); // Save the profile picture at index 0
    await user.save();

    res.redirect("/profile");
  }
);

/////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////

//signup
router.post("/signup", function (req, res) {
  var userdata = new userModel({
    username: req.body.username,
    email: req.body.email,
    fullname: req.body.fullname,
    dp: ["default-profile.png"], // first element will be this always by default
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
// Login
router.post(
  "/login",
  passport.authenticate("local", {
    successRedirect: "/profile",
    failureRedirect: "/login",
    failureFlash: true, // Enables flash messages on failure
  }),
  function (req, res) {}
);
// Logout
router.get("/logout", isLoggedIn, function (req, res, next) {
  req.logout(function (err) {
    if (err) {
      return next(err);
    }
    res.redirect("/");
  });
});

// Middleware to check if the user is logged in
function isLoggedIn(req, res, next) {
  if (req.isAuthenticated()) {
    return next();
  }
  res.redirect("/");
}
// Error-handling middleware
router.use(function (err, req, res, next) {
  console.error(err.stack); // Log the error stack for debugging
  res.status(500).send("Something went wrong!"); // Send a generic error message
});
// If userModel.findById fails (e.g., due to a database connection issue or invalid ObjectId), the error is caught and passed to next(err). Express will then call the error-handling middleware where you can log the error, send a response, or even render a custom error page.

module.exports = router;
