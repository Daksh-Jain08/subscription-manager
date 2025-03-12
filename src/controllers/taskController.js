const Task = require("../models/Task");
const { DateTime } = require("luxon");

/* Function to validate the datetime format
 The function will return a JavaScript Date object
 If the input is a valid datetime string
 Otherwise, it will throw an error
*/
const validateDatetime = (datetime) => {
  if (!datetime) {
    throw new Error("Datetime is required.");
  }

  // Try parsing the datetime
  let dt = DateTime.fromISO(datetime, { zone: "utc" });

  // If only date is provided, set default time to 23:59:59
  if (!dt.isValid) {
    dt = DateTime.fromFormat(datetime, "yyyy-MM-dd", { zone: "utc" });
    if (dt.isValid) {
      dt = dt.set({ hour: 23, minute: 59, second: 59 });
    }
  }

  if (!dt.isValid) {
    throw new Error(
      "Invalid datetime format. Use YYYY-MM-DD or YYYY-MM-DDTHH:mm:ss"
    );
  }

  return dt.toJSDate(); // Return a JavaScript Date object for MongoDB
};

// @desc Create a new task
// @route POST /api/tasks
// @access Private
const createTask = async (req, res) => {
  const { title, description, deadline, priority, reminderTime } = req.body;
  if (!title || !deadline) {
    return res
      .status(400)
      .json({ message: "Please enter a title and deadline" });
  }

  const user = req.user;
  try {
    const taskDeadline = validateDatetime(deadline);
    if (taskDeadline < new Date()) {
      return res.status(400).json({ message: "Deadline is in the past" });
    }
    let reminder = reminderTime ? validateDatetime(reminderTime) : taskDeadline;
    if (reminder === taskDeadline) {
      reminder.setDate(reminder.getDate() - 1);
    }
    if(reminder < new Date()) {
      reminder = null;
    }
    const taskPriority = priority || "medium";
    const task = await Task.create({
      title,
      description,
      deadline: taskDeadline,
      priority: taskPriority,
      reminderTime: reminder,
      user: user._id,
    });
    return res.status(201).json({ task });
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};

// @desc Get all tasks
// @route GET /api/tasks/admin
// @access Admin
const getAllTasksAdmin = async (req, res) => {
  try {
    const tasks = await Task.find({});
    return res.status(200).json({ tasks });
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};

// @desc Get all tasks
// @route GET /api/tasks
// @access Private
const getAllTasks = async (req, res) => {
  const user = req.user;
  const { priority, completed, page, limit, deadlineFrom, deadlineTo, sortBy } =
    req.query;
  const taskPage = parseInt(page, 10) || 1;
  const taskLimit = parseInt(limit, 10) || 10;
  const query = { user: user._id, isDeleted: false };
  if (taskPage < 1 || taskLimit < 1) {
    return res.status(400).json({ message: "Invalid query parameters" });
  }
  if (taskLimit > 50) {
    return res.status(400).json({ message: "Limit should be less than 50" });
  }
  try {
    if (priority) {
      query.priority = priority;
    }
    if (completed) {
      query.completed = completed === "true";
    }
    if (deadlineFrom || deadlineTo) {
      query.deadline = {};
      if (deadlineFrom) {
        query.deadline.$gte = validateDatetime(deadlineFrom);
      }
      if (deadlineTo) {
        query.deadline.$lte = validateDatetime(deadlineTo);
      }
    }
    const allowedSortFields = ["createdAt", "priority", "deadline"];
    const sortField = allowedSortFields.includes(sortBy)
      ? sortBy
      : "-createdAt";

    const tasks = await Task.find(query)
      .sort(sortField)
      .skip((taskPage - 1) * taskLimit)
      .limit(taskLimit);
    const count = await Task.countDocuments(query);
    if (count < (taskPage - 1) * taskLimit) {
      return res.status(400).json({ message: "The page does not exist" });
    }
    return res
      .status(200)
      .json({
        tasks,
        pages: Math.ceil(count / taskLimit),
        currentPage: taskPage,
      });
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};

// @desc Get a task by id
// @route GET /api/tasks/:id
// @access Private
const getTaskById = async (req, res) => {
  const id = req.params.id;
  const user = req.user;
  try {
    const task = await Task.findOne({ _id: id, isDeleted: false });
    if (!task) {
      return res.status(404).json({ message: "Task not found" });
    }
    if (task.user.toString() !== user._id.toString() && user.role !== "admin") {
      return res
        .status(403)
        .json({ message: "Not authorized to access this task" });
    }
    return res.status(200).json({ task });
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};

// @desc Delete a task
// @route DELETE /api/tasks/:id
// @access Private
const deleteTask = async (req, res) => {
  const id = req.params.id;
  const user = req.user;
  try {
    const task = await Task.findOne({ _id: id, isDeleted: false });
    if (!task) {
      return res.status(404).json({ message: "Task not found" });
    }
    task.isDeleted = true;
    task.save();
    if (task.user.toString() !== user._id.toString() && user.role !== "admin") {
      return res
        .status(403)
        .json({ message: "Not authorized to delete this task" });
    }
    return res.status(200).json({ message: "Task deleted" });
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};

// @desc Update a task
// @route PUT /api/tasks/:id
// @access Private
const updateTask = async (req, res) => {
  const id = req.params.id;
  const user = req.user;
  const { title, description, deadline, priority, completed } = req.body;
  try {
    const task = await Task.findOne({ _id: id, isDeleted: false });
    // task with the given id not found.
    if (!task) {
      return res.status(404).json({ message: "Task not found" });
    }
    // task does not belong to the user.
    if (task.user.toString() !== user._id.toString()) {
      return res
        .status(403)
        .json({ message: "Not authorized to update this task" });
    }
    // validate the deadline
    const taskDeadline = validateDatetime(deadline);
    // update the task
    const updatedTask = await Task.findByIdAndUpdate(
      id,
      { title, description, deadline: taskDeadline, priority, completed },
      { new: true }
    );
    return res.status(200).json({ message: "Task updated", updatedTask });
  } catch (err) {
    return res.status(500).json({ message: err.massage });
  }
};

module.exports = {
  createTask,
  getAllTasks,
  getAllTasksAdmin,
  getTaskById,
  deleteTask,
  updateTask,
};
