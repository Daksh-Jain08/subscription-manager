const cron = require('node-cron');
const sendEmail = require('./email');
const Task = require('../models/Task');

cron.schedule('*/1 * * * *', async () => {
    const now = new Date();
    try {
        const tasksToRemind = await Task.find({
            reminderTime: { $lte: now },
            isDeleted: false
        }).populate(`user`, `email`);

        for(let task of tasksToRemind){
            const email = task.user.email;
            const subject = `Reminder: ${task.title}`;
            const text = `Description: ${task.description}\nDeadline: ${task.deadline}`;
            await sendEmail(email, subject, text);
            task.reminderTime = null;
            await task.save();
        }
        console.log(`Reminders sent to ${tasksToRemind.length} users at ${now}`);
    } catch(err){
        console.log(`reminder sending failed: ${err}`)
    }
})