// app.js
require("dotenv").config(); // Load environment variables from .env file
const mongoose = require("mongoose");
//
var express = require("express");
var path = require("path");
var cookieParser = require("cookie-parser");
var logger = require("morgan");
var expressSession = require("express-session");
const passport = require("passport");
const flash = require("connect-flash");

// Connect to MongoDB Atlas
const dbURI = process.env.MONGODB_URI;
if (!dbURI) {
  console.error("MongoDB URI is not defined in .env file");
  process.exit(1); // Exit the process if no URI is found
}
mongoose
  .connect(dbURI)
  .then(() => console.log("MongoDB connected successfully"))
  .catch((err) => console.error("MongoDB connection error:", err));

// routers
var indexRouter = require("./routes/index");
var usersRouter = require("./routes/users");

var app = express();

// view engine setup
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "ejs");

// Middleware setup
app.use(logger("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, "public")));

// Session middleware
app.use(
  expressSession({
    resave: false,
    saveUninitialized: false,
    secret: "bruh",
  })
);

// Flash messages
app.use(flash());
// Middleware to make flash messages available to all views

// Passport middleware
app.use(passport.initialize());
app.use(passport.session());
passport.serializeUser(usersRouter.serializeUser());
passport.deserializeUser(usersRouter.deserializeUser());

// Use routers
app.use("/", indexRouter);
app.use("/users", usersRouter);

// catch 404 and forward to error handler
app.use(function (req, res, next) {
  next(createError(404));
});

// error handler
app.use(function (err, req, res, next) {
  res.locals.message = err.message;
  res.locals.error = req.app.get("env") === "development" ? err : {};

  res.status(err.status || 500);
  res.render("error");
});

module.exports = app;
