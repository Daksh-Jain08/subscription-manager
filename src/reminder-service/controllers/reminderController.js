const { parse } = require("dotenv");
const prisma = require("../prisma")
const { validateDateTime } = require("../utils/dates");

const getAllReminders = async (req, res) => {
    try {
        // Check if the user is authenticated
        const user = req.user;
        if (!user) {
            return res.status(401).json({ message: "Unauthorized" });
        }
        const reminders = await prisma.reminder.findMany({
            where: {
                userId: user.id,
            }
        })
        return res.status(200).json(reminders);
    } catch (err) {
        console.log(`Error in getAllReminders: ${err}`);
        return res.status(500).json({ message: "Internal Server Error" });
    }
}

const getReminderById = async (req, res) => {
    try {
        // Check if the user is authenticated
        const user = req.user;
        if (!user) {
            return res.status(401).json({ message: "Unauthorized" });
        }
        const { id } = req.params;
        const reminder = await prisma.reminder.findUnique({
            where: {
                id: id,
            }
        })
        if (!reminder) {
            return res.status(404).json({ message: "Reminder not found" });
        }
        return res.status(200).json(reminder);
    } catch (err) {
        console.log(`Error in getReminderById: ${err}`);
        return res.status(500).json({ message: "Internal Server Error" });
    }
}

const createReminder = async (req, res) => {
    try {
        // Check if the user is authenticated
        const user = req.user;
        if (!user) {
            return res.status(401).json({ message: "Unauthorized" });
        }
        const { title, description, date } = req.body;
        // Validate the date
        const isValidDate = validateDateTime(date);
        if (!isValidDate) {
            return res.status(400).json({ message: "Invalid date format" });
        }
        if (!title || !description || !date) {
            return res.status(400).json({ message: "Please provide all fields" });
        }
        const reminder = await prisma.reminder.create({
            data: {
                title,
                description,
                date,
                userId: user.id,
            }
        })
        return res.status(201).json(reminder);
    } catch (err) {
        console.log(`Error in createReminder: ${err}`);
        return res.status(500).json({ message: "Internal Server Error" });
    }
}

const updateReminder = async (req, res) => {
    try {
        // Check if the user is authenticated
        const user = req.user;
        if (!user) {
            return res.status(401).json({ message: "Unauthorized" });
        }
        const { id } = req.params;
        const { title, description, date } = req.body;
        // Validate the date
        const isValidDate = validateDateTime(date);
        if (!isValidDate) {
            return res.status(400).json({ message: "Invalid date format" });
        }
        if (!title && !description && !date) {
            return res.status(400).json({ message: "Please provide either title, description or date" });
        }
        const updateBody = {};
        for (const key in req.body) {
            if (req.body[key]) {
                updateBody[key] = req.body[key];
            }
        }
        const reminder = await prisma.reminder.update({
            where: {
                id: id,
            },
            data: {
                title,
                description,
                date,
            }
        })
        return res.status(200).json(reminder);
    } catch (err) {
        console.log(`Error in updateReminder: ${err}`);
        return res.status(500).json({ message: "Internal Server Error" });
    }
}

const deleteReminder = async (req, res) => {
    try {
        // Check if the user is authenticated
        const user = req.user;
        if (!user) {
            return res.status(401).json({ message: "Unauthorized" });
        }
        const { id } = req.params;
        const reminder = await prisma.reminder.findUnique({
            where: {
                id: id,
            }
        })
        if (!reminder) {
            return res.status(404).json({ message: "Reminder not found" });
        }
        await prisma.reminder.delete({
            where: {
                id: id,
            }
        })
        return res.status(200).json(reminder);
    } catch (err) {
        console.log(`Error in deleteReminder: ${err}`);
        return res.status(500).json({ message: "Internal Server Error" });
    }
}

module.exports = {
    getAllReminders,
    createReminder,
    getReminderById,
    updateReminder,
    deleteReminder,
}