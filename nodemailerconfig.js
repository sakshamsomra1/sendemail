require('dotenv').config(); 

const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  host: "smtp.office365.com",
  port: 587,
  // secure: false, // upgrade later with STARTTLS
  auth: {
    user: "webmaster@plaksha.edu.in",
    pass: process.env.EMAIL_PASSWORD,
  },
});

module.exports = transporter;  