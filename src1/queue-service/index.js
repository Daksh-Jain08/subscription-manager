const express = require("express");
const queue = require("./queue");

const app = express();
app.use(express.json());

require("dotenv").config();

const PORT = process.env.PORT || 5002;

// Enqueue a message
app.post("/enqueue/:queueName", (req, res) => {
	const { queueName } = req.params;
	const message = req.body;

	if (!message || Object.keys(message).length === 0) {
		return res.status(400).json({ error: "Message body required" });
	}

	queue.enqueue(queueName, message);
	res.status(200).json({ message: "Enqueued successfully" });
});

// Dequeue a message
app.get("/dequeue/:queueName", (req, res) => {
	const { queueName } = req.params;
	const message = queue.dequeue(queueName);

	if (!message) {
		return res.status(404).json({ error: "Queue empty or not found" });
	}

	res.status(200).json({ message });
});

// Peek at the next message
app.get("/peek/:queueName", (req, res) => {
	const { queueName } = req.params;
	const message = queue.peek(queueName);

	if (!message) {
		return res.status(404).json({ error: "Queue empty or not found" });
	}

	res.status(200).json({ message });
});

// Get size of queue
app.get("/size/:queueName", (req, res) => {
	const { queueName } = req.params;
	const size = queue.size(queueName);

	res.status(200).json({ size });
});

app.listen(PORT, () => {
	console.log(`Queue service running on port ${PORT}`);
});
