const express = require('express');
const router = express.Router();
const reminderController = require('../controllers/reminderController');

router.route('/').get(reminderController.getAllReminders).post(reminderController.createReminder);
router.route('/:id').get(reminderController.getReminderById).put(reminderController.updateReminder).delete(reminderController.deleteReminder);

module.exports = router;