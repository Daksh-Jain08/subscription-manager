const express = require("express");
require("dotenv").config({path: '../.env'});
const connectDB = require("./config/db")
const cookieParser = require("cookie-parser");
passport = require("passport");
session = require("express-session");
//require("./services/reminder");
require("./config/passport");


const app = express();

connectDB();

app.use(express.json());
app.use(cookieParser());
app.use(session({
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: true
}));
app.use(passport.initialize());
//app.use(passport.session());

const authRouter = require("./routes/authRoutes");
const taskRouter = require("./routes/taskRoutes");

app.use("/api/auth", authRouter);
app.use("/api/tasks", taskRouter);

app.get("/", (req, res) => {
  res.send(`<a href="api/auth/google">Login with Google</a>`);
});

const PORT = process.env.PORT;
app.listen(PORT, () => {
  console.log(`App is listening at ${PORT}`);
});
