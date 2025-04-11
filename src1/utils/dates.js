const { DateTime } = require("luxon");
const Task = require("../models/Task");

/* Function to validate the datetime format.
   Returns a JavaScript Date object in UTC.
*/
const validateDatetime = (datetime) => {
  if (!datetime) {
    throw new Error("Datetime is required.");
  }

  // Try parsing the datetime as ISO format
  let dt = DateTime.fromISO(datetime);

  // If only a date is provided, set default time to 23:59:59
  if (!dt.isValid) {
    dt = DateTime.fromFormat(datetime, "yyyy-MM-dd");
    if (dt.isValid) {
      dt = dt.set({ hour: 23, minute: 59, second: 59 });
    }
  }

  if (!dt.isValid) {
    throw new Error(
      "Invalid datetime format. Use YYYY-MM-DD or YYYY-MM-DDTHH:mm:ss"
    );
  }

  // Convert to UTC explicitly
  dt = dt.toUTC();

  const jsDate = dt.toJSDate();
  if (jsDate < new Date()) {
    throw new Error("Deadline should be in the future");
  }

  return jsDate;
};

/* Helper to transform task timestamps to IST (GMT+5:30)
   This converts deadline, reminderTime, createdAt, and updatedAt.
*/
const transformTaskToIST = (task) => {
  // Convert to plain object (if Mongoose document)
  const taskObj = task.toObject ? task.toObject() : task;
  if (taskObj.deadline)
    taskObj.deadline = DateTime.fromJSDate(taskObj.deadline)
      .setZone("Asia/Kolkata")
      .toISO();
  if (taskObj.reminderTime)
    taskObj.reminderTime = DateTime.fromJSDate(taskObj.reminderTime)
      .setZone("Asia/Kolkata")
      .toISO();
  if (taskObj.createdAt)
    taskObj.createdAt = DateTime.fromJSDate(taskObj.createdAt)
      .setZone("Asia/Kolkata")
      .toISO();
  if (taskObj.updatedAt)
    taskObj.updatedAt = DateTime.fromJSDate(taskObj.updatedAt)
      .setZone("Asia/Kolkata")
      .toISO();
  return taskObj;
};

module.exports = {
  validateDatetime,
  transformTaskToIST,
};