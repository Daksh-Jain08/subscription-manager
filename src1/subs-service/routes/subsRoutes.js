const express = require("express");
const router = express.Router();

const subsControllers = require("../controllers/subsControllers");

router.route("/").post(subsControllers.createSubscription).get(subsControllers.getAllSubscriptions);
router.route("/:id").get(subsControllers.getSubscription).patch(subsControllers.updateSubscription).delete(subsControllers.deleteSubscription);

module.exports = router;
