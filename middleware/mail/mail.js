require('dotenv').config();
const nodemailer = require('nodemailer');
const { TEMPLATE_WELCOME_MAIL, TEMPLATE_RESET_MAIL, TEMPLATE_ADMIN_WELCOME_MAIL } = require('./mail_temp');
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
// Function to send registration email
const sendregisterEmail = async (email, name, phoneNo, isFaculty, type) => {
  try {
    console.log("sendregisterEmail");

    const tokenData = { email, name, phoneNo, isFaculty };
    const token = await registermailtoken(tokenData, type);
    console.log(token);

    const verificationUrl = `${process.env.STATIC_URL}/password?token=${token}#type=register`;

    const htmlContent = type === 'admin'
      ? TEMPLATE_ADMIN_WELCOME_MAIL(name, verificationUrl)
      : TEMPLATE_WELCOME_MAIL(name, verificationUrl);

    const mailOptions = {
      from: process.env.EMAIL_FROM,  
      to: email,
      subject: 'Amuda-lab- Verify Your Email and Set Your Password',
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

// Function to send forgot password email
const sendforgotEmail = async (email, name) => {
  try {
    console.log("sendforgotEmail");

    const tokenData = { email, name };
    const token = await forgotmailtoken(tokenData);
    console.log(token);

    const verificationUrl = `${process.env.STATIC_URL}/password?token=${token}#type=forgot`;

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

module.exports = { sendregisterEmail, sendforgotEmail };
