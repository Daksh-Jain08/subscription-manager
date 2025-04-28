const express = require("express");
const dotenv = require("dotenv");
const reminderRoutes = require("./routes/reminderRoutes");
const { isAuthenticated } = require('./middleware/authMiddleware');
const { startPolling } = require("./utils/remind");
const reminderGrpcServer = require('./grpcServer');


dotenv.config();

const app = express();

const startApp = async () => {
    try {
        app.use(express.json());
        app.get("/", (req, res) => {
            res.send("Reminder Service is running");
        });

        app.use("/api/reminder", isAuthenticated, reminderRoutes);
        const PORT = process.env.PORT || 5004;
        startPolling();
        app.listen(PORT, () => {
            console.log(`Reminder Service listening on port ${PORT}`);
        });
        reminderGrpcServer.start();
    } catch (err) {
        console.log(`Something went wrong:\n${err}`);
    }
};

startApp();
