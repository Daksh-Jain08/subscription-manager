const sendMail = require("./mailer");

exports.sendVerificationEmail = async (userEmail, username, link) => {
  return await sendMail({
    to: userEmail,
    subject: "Verify your email",
    htmlPath: "verification.html",
    replacements: { username, link }
  });
};

exports.sendWelcomeEmail = async (userEmail, username) => {
  return await sendMail({
    to: userEmail,
    subject: "Welcome to TaskManager!",
    htmlPath: "welcome.html",
    replacements: { username }
  });
};

exports.sendReminderEmail = async (userEmail, username, taskTitle, dueDate) => {
  return await sendMail({
    to: userEmail,
    subject: "Task Reminder",
    htmlPath: "reminder.html",
    replacements: { username, taskTitle, dueDate }
  });
};

exports.sendPasswordResetEmail = async (userEmail, username, link) => {
  return await sendMail({
    to: userEmail,
    subject: "Reset your password",
    htmlPath: "reset_password.html",
    replacements: { username, link }
  });
};
