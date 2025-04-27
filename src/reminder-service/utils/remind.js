const prisma = require("../prisma")
const axios = require("axios");

const emailQueue = "sendEmail";
const notifQueue = "sendNotification";

const POLL_INTERVAL = 60000; // 1 minute

async function pollReminders() {
    try {
        console.log("Polling for reminders...");
        const reminders = await prisma.reminder.findMany({
            where: {
                date: {
                    lte: new Date(),
                },
                sent: false,
            }
        })
        for (const reminder of reminders) {
            // Send the reminder
            console.log(`Sending reminder: ${reminder.title}`);
            await sendReminder(reminder);
            // Mark the reminder as sent
            await markReminderAsSent(reminder.id);
        }
    } catch (err) {
        console.log(`Error in pollReminders: ${err}`);
    }
}

async function sendReminder(reminder) {
    try {
        // Logic to send the reminder (e.g., email, SMS, etc.)
        console.log(`Sending reminder: ${reminder.title} - ${reminder.description}`);
        await axios.post(`${process.env.QUEUE_URL}/enqueue/${emailQueue}`, { reminder });
        await axios.post(`${process.env.QUEUE_URL}/enqueue/${notifQueue}`, { reminder });
    } catch (err) {
        console.log(`Error in sendReminder: ${err}`);
    }
}

async function markReminderAsSent(reminderId) {
    try {
        await prisma.reminders.update({
            where: { id: reminderId },
            data: { sent: true }
        });
    } catch (err) {
        console.log(`Error in markReminderAsSent: ${err}`);
    }
}

function startPolling() {
    setInterval(() => {
        pollReminders();
    }, POLL_INTERVAL);
}

module.exports = { startPolling }