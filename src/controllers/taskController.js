const Task = require("../models/Task");
const { validateDatetime, transformTaskToIST } = require("../utils/dates");

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
    let reminder;
    if (reminderTime) {
      try {
        reminder = validateDatetime(reminderTime);
      } catch (error) {
        reminder = null;
      }
    } else {
      reminder = new Date(taskDeadline);
      reminder.setDate(reminder.getDate() - 1);
    }
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
    // Convert the created task to IST before sending it
    const transformedTask = transformTaskToIST(task);
    return res.status(201).json({ task: transformedTask });
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};

// @desc Get all tasks
// @route GET /api/tasks/admin
// @access Admin
const getAllTasksAdmin = async (req, res) => {
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

  // Build the query object without a user filter for admin
  const query = { isDeleted: false };
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

    // Map each task to an object with IST timestamps
    const transformedTasks = tasks.map(task => transformTaskToIST(task));

    if ((taskPage - 1) * taskLimit >= count) {
      return res.status(400).json({ message: "The page does not exist" });
    }
    return res.status(200).json({
      tasks: transformedTasks,
      totalPages: Math.ceil(count / taskLimit),
      currentPage: taskPage,
      totalTasks: count,
    });
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

    // Convert each returned task to IST
    const transformedTasks = tasks.map(task => transformTaskToIST(task));

    if ((taskPage - 1) * taskLimit >= count) {
      return res.status(400).json({ message: "The page does not exist" });
    }
    return res.status(200).json({
      tasks: transformedTasks,
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
    // Convert to IST before returning
    const transformedTask = transformTaskToIST(task);
    return res.status(200).json({ task: transformedTask });
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
    if (!task) {
      return res.status(404).json({ message: "Task not found" });
    }
    // Allow admin to update any task; regular users can only update their own
    if (task.user.toString() !== user._id.toString() && user.role !== "admin") {
      return res.status(403).json({ message: "Not authorized to update this task" });
    }

    const updateFields = {};
    if (title) updateFields.title = title;
    if (description) updateFields.description = description;
    if (deadline) {
      // Validate and convert deadline to UTC then update
      updateFields.deadline = validateDatetime(deadline);
    }
    if (typeof reminderTime !== "undefined") {
      try {
        updateFields.reminderTime = validateDatetime(reminderTime);
      } catch (error) {
        updateFields.reminderTime = null;
      }
    }
    if (priority) updateFields.priority = priority;
    if (typeof completed !== "undefined") updateFields.completed = completed;

    const updatedTask = await Task.findByIdAndUpdate(
      id,
      { $set: updateFields },
      { new: true }
    );
    
    // Transform updated task timestamps to IST before sending to client
    const transformedTask = transformTaskToIST(updatedTask);
    return res
      .status(200)
      .json({ message: "Task updated", updatedTask: transformedTask });
  } catch (err) {
    return res.status(500).json({ message: err.message });
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
