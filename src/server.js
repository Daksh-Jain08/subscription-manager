const express = require("express");
require("dotenv").config({path: '../.env'});
const connectDB = require("./config/db")
const cookieParser = require("cookie-parser");

const app = express();

connectDB();

app.use(express.json());
app.use(cookieParser());

const authRouter = require("./routes/authRoutes");
const taskRouter = require("./routes/taskRoutes");

app.use("/api/auth", authRouter);
app.use("/api/tasks", taskRouter);

app.get("/", (req, res) => {
  res.send("Task Manager API is running...");
});

const PORT = process.env.PORT;
app.listen(PORT, () => {
  console.log(`App is listening at ${PORT}`);
});
