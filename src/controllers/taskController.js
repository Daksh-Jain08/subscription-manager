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

  // Try parsing the datetime without forcing the zone
  let dt = DateTime.fromISO(datetime);

  // If only date is provided, set default time to 23:59:59
  if (!dt.isValid) {
    dt = DateTime.fromFormat(datetime, "yyyy-MM-dd");
    if (dt.isValid) {
      dt = dt.set({ hour: 23, minute: 59, second: 59 });
    }
  }

  if (!dt.isValid) {
    throw new Error(
      "Invalid datetime format. Use YYYY-MM-DD or YYYY-MM-DDTHH:mm:ss"
    );
  }

  // Convert to UTC explicitly
  dt = dt.toUTC();

  const jsDate = dt.toJSDate();
  if (jsDate < new Date()) {
    throw new Error("Deadline should be in the future");
  }

  return jsDate; // Return a JavaScript Date object in UTC for MongoDB
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
    // Convert the deadline to a UTC Date using the validateDatetime helper
    const taskDeadline = validateDatetime(deadline);
    console.log("Task deadline (UTC):", taskDeadline);

    let reminder;
    if (reminderTime) {
      // Validate the provided reminder time
      try {
        reminder = validateDatetime(reminderTime);
      } catch (error) {
        // If error occurs (e.g., reminder is in the past), set reminder to null
        reminder = null;
      }
    } else {
      // If reminderTime not provided, default to 1 day before deadline (in UTC)
      reminder = new Date(taskDeadline);
      reminder.setDate(reminder.getDate() - 1);
    }
    
    // If the computed reminder is already past, ignore it
    if (reminder && reminder < new Date()) {
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
  const {
    priority,
    completed,
    page = "1",
    limit = "10",
    deadlineFrom,
    deadlineTo,
    sortBy,
  } = req.query;

  const taskPage = parseInt(page, 10);
  const taskLimit = parseInt(limit, 10);

  // Validate pagination parameters
  if (isNaN(taskPage) || isNaN(taskLimit) || taskPage < 1 || taskLimit < 1) {
    return res.status(400).json({ message: "Invalid pagination parameters" });
  }
  if (taskLimit > 50) {
    return res.status(400).json({ message: "Limit must be less than or equal to 50" });
  }

  // Build the query object
  const query = { user: user._id, isDeleted: false };
  if (priority) {
    query.priority = priority;
  }
  if (typeof completed !== "undefined") {
    // Convert completed string into a boolean
    query.completed = completed === "true";
  }
  if (deadlineFrom || deadlineTo) {
    query.deadline = {};
    try {
      if (deadlineFrom) {
        // Convert deadlineFrom to UTC using validateDatetime helper
        query.deadline.$gte = validateDatetime(deadlineFrom);
      }
      if (deadlineTo) {
        // Convert deadlineTo to UTC using validateDatetime helper
        query.deadline.$lte = validateDatetime(deadlineTo);
      }
    } catch (error) {
      return res.status(400).json({ message: error.message });
    }
  }

  // Set up sorting: allow only specific fields, default to descending order by createdAt
  const allowedSortFields = ["createdAt", "priority", "deadline"];
  let sortField;
  if (allowedSortFields.includes(sortBy)) {
    sortField = sortBy;
  } else {
    sortField = "-createdAt";
  }

  try {
    const tasks = await Task.find(query)
      .sort(sortField)
      .skip((taskPage - 1) * taskLimit)
      .limit(taskLimit);
    const count = await Task.countDocuments(query);

    // If page offset exceeds count, respond with an error
    if ((taskPage - 1) * taskLimit >= count) {
      return res.status(400).json({ message: "The page does not exist" });
    }
    return res.status(200).json({
      tasks,
      totalPages: Math.ceil(count / taskLimit),
      currentPage: taskPage,
      totalTasks: count,
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
  const { title, description, deadline, reminderTime, priority, completed } = req.body;
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
    const taskDeadline = deadline ? validateDatetime(deadline) : task.deadline;
    // validate the reminder time
    const taskReminderTime = reminderTime ? validateDatetime(reminderTime) : null;
    // update the task
    const updatedTask = await Task.findByIdAndUpdate(
      id,
      { title, description, deadline: taskDeadline, reminderTime: taskReminderTime, priority, completed },
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
