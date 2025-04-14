const { DateTime } = require("luxon");

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
const transformSubToIST = (sub) => {
  // Convert to plain object (if Mongoose document)
  if (sub.renewalDate)
    sub.renewalDate = DateTime.fromJSDate(sub.renewalDate)
      .setZone("Asia/Kolkata")
      .toISO();
  if (sub.createdAt)
    sub.createdAt = DateTime.fromJSDate(sub.createdAt)
      .setZone("Asia/Kolkata")
      .toISO();
  if (sub.updatedAt)
    sub.updatedAt = DateTime.fromJSDate(sub.updatedAt)
      .setZone("Asia/Kolkata")
      .toISO();
  return sub;
};

module.exports = {
  validateDatetime,
  transformSubToIST,
};
