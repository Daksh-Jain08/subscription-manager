const prisma = require("../prisma");
const jwt = require("jsonwebtoken");
//const { sendMail } = require("../services/sendMail");
const { validateDatetime } = require("../utils/dates");
const { reminderClient } = require("../reminderClient")

const getAllSubscriptions = async (req, res) => {
	try {
		const userId = req.user.id;
		const subs = await prisma.subscription.findMany({
			where: { userId: userId },
			select: {
				id: true,
				serviceName: true,
				price: true,
				renewalDate: true,
				status: true,
			}
		});
		res.status(200).json({ subs });
	} catch (err) {
		console.log(err);
		res.status(500).json({ message: "INTERNAL SERVER ERROR" });
	}
};

const createSubscription = async (req, res) => {
	try {
		const data = req.body;
		if (!data.serviceName || !data.price || !data.renewalDate) {
			return res
				.status(400)
				.json({ message: "serviceName, price and renewalDate are required" });
		}
		const userId = req.user.id;
		data.userId = userId;
		data.renewalDate = validateDatetime(data.renewalDate);
		const sub = await prisma.subscription.create({
			data: data,
		});
		res.status(201).json({ sub });
	} catch (err) {
		console.log(err);
		res.status(500).json({ message: "INTERNAL SERVER ERROR" });
	}
};

const getSubscription = async (req, res) => {
	try {
		//const userId = req.user.id;
		const id = req.params.id;
		const sub = await prisma.subscription.findUnique({ where: { id: id } });
		if (!sub) {
			res.status(404).json({ message: "Subscription not found" });
		}
		// if (sub.userId !== userId) {
		// 	res
		// 		.status(403)
		// 		.json({ message: "Not authorized to access the resource" });
		// }

		return res.status(200).json({ sub });
	} catch (err) {
		console.log(err);
		res.status(500).json({ message: "INTERNAL SERVER ERROR" });
	}
};

const updateSubscription = async (req, res) => {
	try {
		const id = req.params.id;
		const userId = req.user.id;
		const { serviceName, price, renewalDate } = req.body;

		const sub = await prisma.subscription.findUnique({ where: { id: id } });
		if (!sub) {
			return res.status(404).json({ message: "Subscription not found" });
		}
		if (sub.userId !== userId) {
			return res
				.status(403)
				.json({ message: "Not authorized to update this task" });
		}
		const updateFields = {};
		if (serviceName) updateFields.serviceName = serviceName;
		if (price) updateFields.price = price;
		if (renewalDate) updateFields.renewalDate = validateDatetime(renewalDate);

		const updatedSubs = await prisma.subscription.update({
			where: { id: id },
			data: updateFields,
		});
		res.status(200).json({
			message: "Subscription updated",
			sub,
		});
	} catch (err) {
		console.log(err);
		res.status(500).json({ message: "INTERNAL SEVER ERROR" });
	}
};


const deleteSubscription = async (req, res) => {
	const id = req.params.id;
	const userId = req.user.id;
	try {
		const sub = await prisma.subscription.findUnique({ where: { id: id } });
		if (!sub) {
			return res.status(404).json({ message: "Subscription not found" });
		}
		if (sub.userId !== userId) {
			return res
				.status(403)
				.json({ message: "Not authorized to delete this task" });
		}
		await prisma.subscription.delete({ where: { id: id } });
		reminderClient.DeleteRemindersForSub(
			{ subscriptionId: id },
			(err, response) => {
				if (err) {
					console.error("Error deleting reminders:", err);
				} else {
					console.log("Reminders deleted successfully:", response);
				}
			}
		)
		res.status(200).json({ message: "Subscription deleted" });
	} catch (err) {
		console.log(err);
		res.status(500).json({ message: "INTERNAL SERVER ERROR" });
	}
};

module.exports = {
	createSubscription,
	getAllSubscriptions,
	getSubscription,
	updateSubscription,
	deleteSubscription,
};
