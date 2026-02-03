const nodemailer = require("nodemailer");

const hasEmailConfig = !!process.env.EMAIL_HOST;
const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST,
  port: process.env.EMAIL_PORT ? parseInt(process.env.EMAIL_PORT) : 465,
  secure: process.env.EMAIL_SECURE === "false" ? false : true,
  auth: process.env.EMAIL_USER && process.env.EMAIL_PASS ? {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  } : undefined,
});

// Debug connection on startup only if configured
if (hasEmailConfig) {
  transporter.verify(function (error, success) {
    if (error) {
      console.error("Email transporter error:", error);
    } else {
      console.log("Email transporter is ready");
    }
  });
} else {
  console.warn("Email transporter verify skipped: EMAIL_HOST not set");
}

module.exports = transporter;
