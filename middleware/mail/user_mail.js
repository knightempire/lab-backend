require('dotenv').config();
const nodemailer = require('nodemailer');
const { USER_ACCEPT_MAIL_TEMPLATE, USER_REJECT_MAIL_TEMPLATE, USER_REMINDER_MAIL_TEMPLATE, USER_DELAY_MAIL_TEMPLATE, USER_RE_NOTIFY_MAIL_TEMPLATE, USER_RE_ACCEPT_MAIL_TEMPLATE, USER_RE_REJECT_MAIL_TEMPLATE } = require('./user_mail_temp');

// Nodemailer transporter setup using environment variables
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: process.env.SMTP_PORT,
  secure: process.env.SMTP_SECURE === 'true',
  auth: {
    user: process.env.BREVO_USER,
    pass: process.env.BREVO_PASS,
  },
});

// Function to send user accept email
const sendUserAcceptEmail = async (email, name, requestDate, dueDate, Request_ID) => {
  try {
    console.log("sendUserAcceptEmail");
    const htmlContent = USER_ACCEPT_MAIL_TEMPLATE(name, requestDate, dueDate, Request_ID);
    const mailOptions = {
      from: process.env.EMAIL_FROM,
      to: email,
      subject: 'Amudalab -',
      text: `Hello ${name}`,
      html: htmlContent,
    };
    await transporter.sendMail(mailOptions);
    console.log("User accept email sent successfully ✅");
  } catch (error) {
    console.error("Error sending user accept email ❌:", error.response || error);
    throw new Error('Error sending user accept email');
  }
};

// Function to send user reject email
const sendUserRejectEmail = async (email, name, requestDate, Request_ID, reason) => {
  try {
    console.log("sendUserRejectEmail");
    const htmlContent = USER_REJECT_MAIL_TEMPLATE(name, requestDate, Request_ID, reason);
    const mailOptions = {
      from: process.env.EMAIL_FROM,
      to: email,
      subject: 'Amudalab -',
      text: `Hello ${name}`,
      html: htmlContent,
    };
    await transporter.sendMail(mailOptions);
    console.log("User reject email sent successfully ✅");
  } catch (error) {
    console.error("Error sending user reject email ❌:", error.response || error);
    throw new Error('Error sending user reject email');
  }
};

// Function to send user reminder email
const sendUserReminderEmail = async (email, name, Request_ID, issuedDate, dueDate) => {
  try {
    console.log("sendUserReminderEmail");
    const htmlContent = USER_REMINDER_MAIL_TEMPLATE(name, Request_ID, issuedDate, dueDate);
    const mailOptions = {
      from: process.env.EMAIL_FROM,
      to: email,
      subject: 'Amudalab -',
      text: `Hello ${name}`,
      html: htmlContent,
    };
    await transporter.sendMail(mailOptions);
    console.log("User reminder email sent successfully ✅");
  } catch (error) {
    console.error("Error sending user reminder email ❌:", error.response || error);
    throw new Error('Error sending user reminder email');
  }
};

// Function to send user delay email
const sendUserDelayEmail = async (email, name, Request_ID, issuedDate, dueDate) => {
  try {
    console.log("sendUserDelayEmail");
    const htmlContent = USER_DELAY_MAIL_TEMPLATE(name, Request_ID, issuedDate, dueDate);
    const mailOptions = {
      from: process.env.EMAIL_FROM,
      to: email,
      subject: 'Amudalab -',
      text: `Hello ${name}`,
      html: htmlContent,
    };
    await transporter.sendMail(mailOptions);
    console.log("User delay email sent successfully ✅");
  } catch (error) {
    console.error("Error sending user delay email ❌:", error.response || error);
    throw new Error('Error sending user delay email');
  }
};

// Function to send user re-notify email
const sendUserReNotifyEmail = async (email, name, Request_ID) => {
  try {
    console.log("sendUserReNotifyEmail");
    const htmlContent = USER_RE_NOTIFY_MAIL_TEMPLATE(name, Request_ID);
    const mailOptions = {
      from: process.env.EMAIL_FROM,
      to: email,
      subject: 'Amudalab -',
      text: `Hello ${name}`,
      html: htmlContent,
    };
    await transporter.sendMail(mailOptions);
    console.log("User re-notify email sent successfully ✅");
  } catch (error) {
    console.error("Error sending user re-notify email ❌:", error.response || error);
    throw new Error('Error sending user re-notify email');
  }
};

// Function to send user re-accept email
const sendUserReAcceptEmail = async (email, name, dueDate, Request_ID) => {
  try {
    console.log("sendUserReAcceptEmail");
    const htmlContent = USER_RE_ACCEPT_MAIL_TEMPLATE(name, dueDate, Request_ID);
    const mailOptions = {
      from: process.env.EMAIL_FROM,
      to: email,
      subject: 'Amudalab -',
      text: `Hello ${name}`,
      html: htmlContent,
    };
    await transporter.sendMail(mailOptions);
    console.log("User re-accept email sent successfully ✅");
  } catch (error) {
    console.error("Error sending user re-accept email ❌:", error.response || error);
    throw new Error('Error sending user re-accept email');
  }
};

// Function to send user re-reject email
const sendUserReRejectEmail = async (email, name, Request_ID, reason) => {
  try {
    console.log("sendUserReRejectEmail");
    const htmlContent = USER_RE_REJECT_MAIL_TEMPLATE(name, Request_ID, reason);
    const mailOptions = {
      from: process.env.EMAIL_FROM,
      to: email,
      subject: 'Amudalab -',
      text: `Hello ${name}`,
      html: htmlContent,
    };
    await transporter.sendMail(mailOptions);
    console.log("User re-reject email sent successfully ✅");
  } catch (error) {
    console.error("Error sending user re-reject email ❌:", error.response || error);
    throw new Error('Error sending user re-reject email');
  }
};

module.exports = {
  sendUserAcceptEmail,
  sendUserRejectEmail,
  sendUserReminderEmail,
  sendUserDelayEmail,
  sendUserReNotifyEmail,
  sendUserReAcceptEmail,
  sendUserReRejectEmail
};