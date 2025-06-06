require('dotenv').config();
const nodemailer = require('nodemailer');
const { STAFF_NOTIFY_MAIL_TEMPLATE, STAFF_ACCEPT_MAIL_TEMPLATE, STAFF_REJECT_MAIL_TEMPLATE, STAFF_RE_NOTIFY_MAIL_TEMPLATE, STAFF_RE_ACCEPT_MAIL_TEMPLATE, STAFF_RE_REJECT_MAIL_TEMPLATE } = require('./staff_mail_temp');
const { registermailtoken, forgotmailtoken } = require('../auth/tokencreation');

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

// Function to send staff notification email
const sendStaffNotifyEmail = async (email, name, Roll_No, Student_Name, Request_ID) => {
  try {
    console.log("sendStaffNotifyEmail");
    const htmlContent = STAFF_NOTIFY_MAIL_TEMPLATE(name, Roll_No, Student_Name, Request_ID);
    const mailOptions = {
      from: process.env.EMAIL_FROM,  
      to: email,
      subject: 'Amudalab -',
      text: `Hello ${name}`,
      html: htmlContent, 
    };
    await transporter.sendMail(mailOptions);
    console.log("Staff notification email sent successfully ✅");
  } catch (error) {
    console.error("Error sending staff notification email ❌:", error.response || error);
    throw new Error('Error sending staff notification email');
  }
};

// Function to send staff accept email
const sendStaffAcceptEmail = async (email, name, Roll_No, Student_Name, Request_ID) => {
  try {
    console.log("sendStaffAcceptEmail");
    const htmlContent = STAFF_ACCEPT_MAIL_TEMPLATE(name, Roll_No, Student_Name, Request_ID);
    const mailOptions = {
      from: process.env.EMAIL_FROM,
      to: email,
      subject: 'Amudalab -',
      text: `Hello ${name}`,
      html: htmlContent,
    };
    await transporter.sendMail(mailOptions);
    console.log("Staff accept email sent successfully ✅");
  } catch (error) {
    console.error("Error sending staff accept email ❌:", error.response || error);
    throw new Error('Error sending staff accept email');
  }
};

// Function to send staff reject email
const sendStaffRejectEmail = async (email, name, Roll_No, Student_Name, Request_ID, reason) => {
  try {
    console.log("sendStaffRejectEmail");
    const htmlContent = STAFF_REJECT_MAIL_TEMPLATE(name, Roll_No, Student_Name, Request_ID, reason);
    const mailOptions = {
      from: process.env.EMAIL_FROM,
      to: email,
      subject: 'Amudalab -',
      text: `Hello ${name}`,
      html: htmlContent,
    };
    await transporter.sendMail(mailOptions);
    console.log("Staff reject email sent successfully ✅");
  } catch (error) {
    console.error("Error sending staff reject email ❌:", error.response || error);
    throw new Error('Error sending staff reject email');
  }
};

// Function to send staff re-notify email
const sendStaffReNotifyEmail = async (email, name, Roll_No, Student_Name, Request_ID, newDueDate) => {
  try {
    console.log("sendStaffReNotifyEmail");
    const htmlContent = STAFF_RE_NOTIFY_MAIL_TEMPLATE(name, Roll_No, Student_Name, Request_ID, newDueDate);
    const mailOptions = {
      from: process.env.EMAIL_FROM,
      to: email,
      subject: 'Amudalab -',
      text: `Hello ${name}`,
      html: htmlContent,
    };
    await transporter.sendMail(mailOptions);
    console.log("Staff re-notify email sent successfully ✅");
  } catch (error) {
    console.error("Error sending staff re-notify email ❌:", error.response || error);
    throw new Error('Error sending staff re-notify email');
  }
};

// Function to send staff re-accept email
const sendStaffReAcceptEmail = async (email, name, Roll_No, Student_Name, Request_ID, newDueDate) => {
  try {
    console.log("sendStaffReAcceptEmail");
    const htmlContent = STAFF_RE_ACCEPT_MAIL_TEMPLATE(name, Roll_No, Student_Name, Request_ID, newDueDate);
    const mailOptions = {
      from: process.env.EMAIL_FROM,
      to: email,
      subject: 'Amudalab -',
      text: `Hello ${name}`,
      html: htmlContent,
    };
    await transporter.sendMail(mailOptions);
    console.log("Staff re-accept email sent successfully ✅");
  } catch (error) {
    console.error("Error sending staff re-accept email ❌:", error.response || error);
    throw new Error('Error sending staff re-accept email');
  }
};

// Function to send staff re-reject email
const sendStaffReRejectEmail = async (email, name, Roll_No, Student_Name, Request_ID, reason) => {
  try {
    console.log("sendStaffReRejectEmail");
    const htmlContent = STAFF_RE_REJECT_MAIL_TEMPLATE(name, Roll_No, Student_Name, Request_ID, reason);
    const mailOptions = {
      from: process.env.EMAIL_FROM,
      to: email,
      subject: 'Amudalab -',
      text: `Hello ${name}`,
      html: htmlContent,
    };
    await transporter.sendMail(mailOptions);
    console.log("Staff re-reject email sent successfully ✅");
  } catch (error) {
    console.error("Error sending staff re-reject email ❌:", error.response || error);
    throw new Error('Error sending staff re-reject email');
  }
};

module.exports = {
  sendStaffNotifyEmail,
  sendStaffAcceptEmail,
  sendStaffRejectEmail,
  sendStaffReNotifyEmail,
  sendStaffReAcceptEmail,
  sendStaffReRejectEmail
};

