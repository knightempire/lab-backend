require('dotenv').config();
const nodemailer = require('nodemailer');
const { TEMPLATE_WELCOME_MAIL, TEMPLATE_RESET_MAIL, TEMPLATE_ADMIN_WELCOME_MAIL } = require('./mail_temp');
const { registermailtoken, forgotmailtoken } = require('../auth/tokencreation');
const { USER_NOTIFY_MAIL_TEMPLATE, USER_ACCEPT_MAIL_TEMPLATE, USER_REJECT_MAIL_TEMPLATE, USER_REMINDER_MAIL_TEMPLATE, USER_DELAY_MAIL_TEMPLATE, USER_RE_NOTIFY_MAIL_TEMPLATE, USER_RE_ACCEPT_MAIL_TEMPLATE, USER_RE_REJECT_MAIL_TEMPLATE, USER_RETURN_MAIL_TEMPLATE, USER_COLLECT_MAIL_TEMPLATE } = require('./user_mail_temp');
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

// Function to send user notify email
const sendUserNotifyEmail = async (email, name, Expected_Duration, Request_Date_Time, Request_ID) => {
  try {
    console.log("sendUserNotifyEmail");
    const htmlContent = USER_NOTIFY_MAIL_TEMPLATE(name, Expected_Duration, Request_Date_Time, Request_ID);
    const mailOptions = {
      from: process.env.EMAIL_FROM,
      to: email,
      subject: 'Request Received – AmudaLab Equipment Management',
      text: `Hello ${name}`,
      html: htmlContent,
    };
    await transporter.sendMail(mailOptions);
    console.log("User notify email sent successfully ✅");
  } catch (error) {
    console.error("Error sending user notify email ❌:", error.response || error);
    throw new Error('Error sending user notify email');
  }
};


// Function to send user accept email
const sendUserAcceptEmail = async (email, name, date, Admin_Expected_Duration, Admin_Schedule_Date_and_Time, Request_ID) => {
  try {
    console.log("sendUserAcceptEmail");
    const htmlContent = USER_ACCEPT_MAIL_TEMPLATE(name, date, Admin_Expected_Duration, Admin_Schedule_Date_and_Time, Request_ID);
    const mailOptions = {
      from: process.env.EMAIL_FROM,
      to: email,
      subject: 'Request Approved – Equipment Ready for Collection',
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
const sendUserRejectEmail = async (email, name, Date, Request_ID, reason) => {
  try {
    console.log("sendUserRejectEmail");
    const htmlContent = USER_REJECT_MAIL_TEMPLATE(name, Date, Request_ID, reason);
    const mailOptions = {
      from: process.env.EMAIL_FROM,
      to: email,
      subject: 'Request Declined – AmudaLab Equipment Notification',
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
const sendUserReminderEmail = async (email, name, Request_ID, Collected_Date_Time, Return_Date_Time) => {
  try {
    console.log("sendUserReminderEmail");
    const htmlContent = USER_REMINDER_MAIL_TEMPLATE(name, Request_ID, Collected_Date_Time, Return_Date_Time);
    const mailOptions = {
      from: process.env.EMAIL_FROM,
      to: email,
      subject: 'Reminder: Upcoming Equipment Return Due Date',
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
const sendUserDelayEmail = async (email, name, Request_ID, Request_Date_Time, Issued_Date_Time, Due_Date_Time) => {
  try {
    console.log("sendUserDelayEmail");
    const htmlContent = USER_DELAY_MAIL_TEMPLATE(name, Request_ID, Request_Date_Time, Issued_Date_Time, Due_Date_Time);
    const mailOptions = {
      from: process.env.EMAIL_FROM,
      to: email,
      subject: 'Reminder: Equipment Return Overdue',
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
      subject: 'Reissue Request Under Review',
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
const sendUserReAcceptEmail = async (email, name, Approved_Date_Time, Request_ID) => {
  try {
    console.log("sendUserReAcceptEmail");
    const htmlContent = USER_RE_ACCEPT_MAIL_TEMPLATE(name, Approved_Date_Time, Request_ID);
    const mailOptions = {
      from: process.env.EMAIL_FROM,
      to: email,
      subject: 'Reissue Request Approved – Updated Due Date',
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
      subject: 'Reissue Request Declined – Action Required',
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

// Function to send user return email
const sendUserReturnEmail = async (email, name, Request_ID, Return_Date_Time) => {
  try {
    console.log("sendUserReturnEmail");
    const htmlContent = USER_RETURN_MAIL_TEMPLATE(name, Request_ID, Return_Date_Time);
    const mailOptions = {
      from: process.env.EMAIL_FROM,
      to: email,
      subject: 'Equipment Returned – Confirmation Received',
      text: `Hello ${name}`,
      html: htmlContent,
    };
    await transporter.sendMail(mailOptions);
    console.log("User return email sent successfully ✅");
  } catch (error) {
    console.error("Error sending user return email ❌:", error.response || error);
    throw new Error('Error sending user return email');
  }
};

// Function to send user collect email
const sendUserCollectEmail = async (email, name, Request_ID, Collection_Date_Time, New_Due_Date) => {
  try {
    console.log("sendUserCollectEmail");
    const htmlContent = USER_COLLECT_MAIL_TEMPLATE(name, Request_ID, Collection_Date_Time, New_Due_Date);
    const mailOptions = {
      from: process.env.EMAIL_FROM,
      to: email,
      subject: 'Collection Confirmed – Updated Return Due Date Provided',
      text: `Hello ${name}`,
      html: htmlContent,
    };
    await transporter.sendMail(mailOptions);
    console.log("User collect email sent successfully ✅");
  } catch (error) {
    console.error("Error sending user collect email ❌:", error.response || error);
    throw new Error('Error sending user collect email');
  }
};





// Function to send staff notification email
const sendStaffNotifyEmail = async (email, name, Student_ID, Student_Name, Request_ID) => {
  try {
    console.log("sendStaffNotifyEmail");
    const htmlContent = STAFF_NOTIFY_MAIL_TEMPLATE(name, Student_ID, Student_Name, Request_ID);
    const mailOptions = {
      from: process.env.EMAIL_FROM,  
      to: email,
      subject: 'Notification – Your Email Referenced in Equipment Request',
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
const sendStaffAcceptEmail = async (email, name, Student_ID, Student_Name, Request_ID) => {
  try {
    console.log("sendStaffAcceptEmail");
    const htmlContent = STAFF_ACCEPT_MAIL_TEMPLATE(name, Student_ID, Student_Name, Request_ID);
    const mailOptions = {
      from: process.env.EMAIL_FROM,
      to: email,
      subject: 'Student Equipment Request Approved – FYI',
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
const sendStaffRejectEmail = async (email, name, Student_ID, Student_Name, Request_ID, reason) => {
  try {
    console.log("sendStaffRejectEmail");
    const htmlContent = STAFF_REJECT_MAIL_TEMPLATE(name, Student_ID, Student_Name, Request_ID, reason);
    const mailOptions = {
      from: process.env.EMAIL_FROM,
      to: email,
      subject: 'Student Equipment Request Declined – FYI',
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
const sendStaffReNotifyEmail = async (email, name, Student_ID, Student_Name, Request_ID) => {
  try {
    console.log("sendStaffReNotifyEmail");
    const htmlContent = STAFF_RE_NOTIFY_MAIL_TEMPLATE(name, Student_ID, Student_Name, Request_ID);
    const mailOptions = {
      from: process.env.EMAIL_FROM,
      to: email,
      subject: 'Student Submitted Equipment Reissue Request – Notification',
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
const sendStaffReAcceptEmail = async (email, name, Student_ID, Student_Name, Request_ID) => {
  try {
    console.log("sendStaffReAcceptEmail");
    const htmlContent = STAFF_RE_ACCEPT_MAIL_TEMPLATE(name, Student_ID, Student_Name, Request_ID);
    const mailOptions = {
      from: process.env.EMAIL_FROM,
      to: email,
      subject: 'Reissue Approved for Student – FYI',
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
const sendStaffReRejectEmail = async (email, name, Student_ID, Student_Name, Request_ID, reason) => {
  try {
    console.log("sendStaffReRejectEmail");
    const htmlContent = STAFF_RE_REJECT_MAIL_TEMPLATE(name, Student_ID, Student_Name, Request_ID, reason);
    const mailOptions = {
      from: process.env.EMAIL_FROM,
      to: email,
      subject: 'Reissue Declined for Student – FYI',
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

  sendUserNotifyEmail,
  sendUserAcceptEmail,
  sendUserRejectEmail,
  sendUserReminderEmail,
  sendUserDelayEmail,
  sendUserReNotifyEmail,
  sendUserReAcceptEmail,
  sendUserReRejectEmail,
  sendUserReturnEmail,
  sendUserCollectEmail,

 sendregisterEmail, 
 sendforgotEmail };
