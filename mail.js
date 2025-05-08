require('dotenv').config();
const nodemailer = require('nodemailer');

console.log('User:', process.env.BREVO_USER);
console.log('Pass:', process.env.BREVO_PASS);

const transporter = nodemailer.createTransport({
  host: "smtp-relay.brevo.com",
  port: 587,
  secure: false,
  auth: {
    user: process.env.BREVO_USER,
    pass: process.env.BREVO_PASS
  }
});

const mailOptions = {
  from: amudalab2025@gmail.com,
  to: 'knightempire24@gmail.com',
  subject: 'Test Email',
  text: 'Hello! This is a test email.',
  html: '<h2>Hello</h2><p>This is a <strong>custom message</strong></p>'
};

transporter.sendMail(mailOptions, (error, info) => {
  if (error) {
    return console.log('Email failed:', error);
  }
  console.log('Email sent:', info.response);
});