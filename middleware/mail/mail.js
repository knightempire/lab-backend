require('dotenv').config();
const nodemailer = require('nodemailer');
const { TEMPLATE_WELCOME_MAIL, TEMPLATE_RESET_MAIL, TEMPLATE_ADMIN_WELCOME_MAIL } = require('./mail_temp');
const { registermailtoken, forgotmailtoken } = require('../auth/tokencreation');
const { USER_ACCEPT_MAIL_TEMPLATE, USER_REJECT_MAIL_TEMPLATE, USER_REMINDER_MAIL_TEMPLATE, USER_DELAY_MAIL_TEMPLATE, USER_RE_NOTIFY_MAIL_TEMPLATE, USER_RE_ACCEPT_MAIL_TEMPLATE, USER_RE_REJECT_MAIL_TEMPLATE } = require('./user_mail_temp');
const { STAFF_NOTIFY_MAIL_TEMPLATE, STAFF_ACCEPT_MAIL_TEMPLATE, STAFF_REJECT_MAIL_TEMPLATE, STAFF_RE_NOTIFY_MAIL_TEMPLATE, STAFF_RE_ACCEPT_MAIL_TEMPLATE, STAFF_RE_REJECT_MAIL_TEMPLATE } = require('./staff_mail_temp');


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
// Function to send registration email
const sendregisterEmail = async (email, name, phoneNo, isFaculty, type) => {
  try {
    console.log("sendregisterEmail");

    const tokenData = { email, name, phoneNo, isFaculty };
    const token = await registermailtoken(tokenData, type);
    console.log(token);

    const verificationUrl = `${process.env.STATIC_URL}/auth/password?token=${token}&type=register`;

    const htmlContent = type === 'admin'
      ? TEMPLATE_ADMIN_WELCOME_MAIL(name, verificationUrl)
      : TEMPLATE_WELCOME_MAIL(name, verificationUrl);

    const mailOptions = {
      from: process.env.EMAIL_FROM,  
      to: email,
      subject: 'Amudalab Equipment Management – Verify Your Account',
      text: `Hello ${name},\n\nWelcome! Click the link below to verify your email and set your password:\n\n${verificationUrl}`,
      html: htmlContent, 
    };

   
    await transporter.sendMail(mailOptions);
    console.log("Register email sent successfully ✅");

  } catch (error) {
    console.error("Error sending register email ❌:", error.response || error);
    throw new Error('Error sending register email');
  }
};


const sendforgotEmail = async (email, name) => {
  try {
    console.log("sendforgotEmail");

    const tokenData = { email, name };
    const token = await forgotmailtoken(tokenData);
    console.log(token);

    const verificationUrl = `${process.env.STATIC_URL}/auth/password?token=${token}&type=forgot`;

    const htmlContent = TEMPLATE_RESET_MAIL(name, verificationUrl);

    const mailOptions = {
      from: process.env.EMAIL_FROM,  
      to: email,  
      subject: 'Amuda-lab- Reset Your Password',
      text: `Hello ${name},\n\nClick the link below to reset your password:\n\n${verificationUrl}`,
      html: htmlContent,  
    };


    await transporter.sendMail(mailOptions);
    console.log("Forgot password email sent successfully ✅");

  } catch (error) {
    console.error("Error sending forgot password email ❌:", error.response || error);
    throw new Error('Error sending forgot password email');
  }
};




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
  sendStaffReRejectEmail,

  sendUserAcceptEmail,
  sendUserRejectEmail,
  sendUserReminderEmail,
  sendUserDelayEmail,
  sendUserReNotifyEmail,
  sendUserReAcceptEmail,
  sendUserReRejectEmail,

 sendregisterEmail, 
 sendforgotEmail };
