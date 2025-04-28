const prisma = require("../../prisma")
const { validateDateTime } = require("../../utils/dates");

const createReminder = async (req, res) => {
    try {
      const { subscriptionId, title, description, date } = req.body;
      const userId = req.user.id; // Assuming authentication middleware sets req.user
  
      if (!subscriptionId || !title || !date) {
        return res.status(400).json({ message: 'subscriptionId, title and date are required' });
      }

      // Validate date format if necessary
      if (!validateDateTime(date)) {
        return res.status(400).json({ message: 'Invalid date format' });
      }
  
      const reminder = await prisma.reminder.create({
        data: {
          userId,
          subscriptionId,
          title,
          description,
          date: new Date(date), // validate properly if needed
        },
      });
  
      res.status(201).json({ reminder });
    } catch (error) {
      console.error('Error creating reminder:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  };
  
  const getAllReminders = async (req, res) => {
    try {
      const userId = req.user.id;
      const reminders = await prisma.reminder.findMany({
        where: { userId },
      });
      res.status(200).json({ reminders });
    } catch (error) {
      console.error('Error fetching reminders:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  };
  
  const updateReminder = async (req, res) => {
    try {
      const { id } = req.params;
      const { title, description, date, snoozeUntil } = req.body;
      // validate date format if necessary
      if (date && !validateDateTime(date)) {
        return res.status(400).json({ message: 'Invalid date format' });
      }
      const userId = req.user.id;
  
      const reminder = await prisma.reminder.updateMany({
        where: { id, userId },
        data: { title, description, date: date ? new Date(date) : undefined, snoozeUntil: snoozeUntil ? new Date(snoozeUntil) : undefined },
      });
  
      if (reminder.count === 0) {
        return res.status(404).json({ message: 'Reminder not found' });
      }
  
      res.status(200).json({ message: 'Reminder updated' });
    } catch (error) {
      console.error('Error updating reminder:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  };
  
  const deleteReminder = async (req, res) => {
    try {
      const { id } = req.params;
      const userId = req.user.id;
  
      const reminder = await prisma.reminder.deleteMany({
        where: { id, userId },
      });
  
      if (reminder.count === 0) {
        return res.status(404).json({ message: 'Reminder not found' });
      }
  
      res.status(200).json({ message: 'Reminder deleted' });
    } catch (error) {
      console.error('Error deleting reminder:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  };

  const getReminderById = async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.user.id;
        const reminder = await prisma.reminder.findUnique({
            where: { id, userId },
        });
        if (!reminder) {
            return res.status(404).json({ message: 'Reminder not found' });
        }
        res.status(200).json({ reminder });
    } catch (error) {
        console.error('Error fetching reminder:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
    }

  const updateReminderSettings = async (req, res) => {
    try{
        const userId = req.user.id;
        const { oldOffset, newOffset, enabled } = req.body;
        if (!oldOffset || !newOffset) {
            return res.status(400).json({ message: 'oldOffset and newOffset are required' });
        }
        const reminders = await prisma.reminder.findMany({
            where: { userId },
        })
        reminders.forEach(async (reminder) => {
            const reminderDate = new Date(reminder.date);
            const newDate = new Date(reminderDate.getTime() + (newOffset - oldOffset) * 60 * 1000);
            const updatedReminder = await prisma.reminder.update({
                where: { id: reminder.id },
                data: {
                    date: newDate,
                    enabled,
                }
            })
        })
        return res.status(200).json({ message: 'Reminder settings updated' });
    } catch (error) {
        console.log('Error updating reminder settings:', error);
        return res.status(500).json({ message: 'Internal server error' });
    }
  }
  
  module.exports = {
    createReminder,
    getAllReminders,
    getReminderById,
    updateReminder,
    deleteReminder,
    updateReminderSettings,
  };