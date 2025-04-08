const nodemailer = require("nodemailer");
const fs = require("fs");
const path = require("path");

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  }
});

async function sendMail({ to, subject, htmlPath, replacements }) {
  let html = fs.readFileSync(path.join(__dirname, "templates", htmlPath), "utf8");

  // Replace placeholders
  for (const key in replacements) {
    const regex = new RegExp(`{{${key}}}`, "g");
    html = html.replace(regex, replacements[key]);
  }

  const mailOptions = {
    from: process.env.EMAIL_FROM,
    to,
    subject,
    html
  };

  return transporter.sendMail(mailOptions);
}

module.exports = sendMail;

