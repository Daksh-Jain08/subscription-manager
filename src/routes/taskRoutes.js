const express = require("express")
const router = express.Router()
const { createTask, getAllTasks, getTaskById, deleteTask, updateTask, getAllTasksAdmin } = require("../controllers/taskController")
const {isAuthenticated, hasPermission} = require("../middleware/authMiddleware")

router.route("/").post(isAuthenticated, createTask).get(isAuthenticated, getAllTasks)
router.route("/admin").get(isAuthenticated, hasPermission('admin'), getAllTasksAdmin);
router.route("/:id").get(isAuthenticated, getTaskById).delete(isAuthenticated, deleteTask).patch(isAuthenticated, updateTask)

module.exports = router;