// controllers/login.contollers.js
require('dotenv').config();

const bcrypt = require('bcryptjs');
const User = require('../models/user.model'); 
const Token = require('../models/token');
const {createToken} = require('../middleware/auth/tokencreation'); 
const {sendregisterEmail,sendforgotEmail} = require('../middleware/mail/mail'); 
const moment = require('moment-timezone'); 
const user = require('../models/user');


const verifyToken = async (req, res) => {
  try {

    const { email, name } = req.body;
    if (!email || !name) {
      return res.status(400).json({
        message: 'Email and name are required',
      });
    }


    // Return a successful response with user details
    res.status(200).json({
      status: 200,
      message: 'Token is valid, verified',
      user: {
        email,
        name,
        rollNo,
      },
    });
  } catch (err) {
    console.error('Token verification error:', err);
    res.status(500).json({
      message: 'An error occurred during token verification',
    });
  }
};




const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;


    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: 'Invalid email or password' });
    }


    console.log('User found:', user);
    console.log('User active:', user.isActive);

    
    if (!user.isActive) {
      return res.status(400).json({ message: 'User is inactive. Please contact support.' });
    }

   
    const isPasswordMatch = await bcrypt.compare(password, user.password);
    if (!isPasswordMatch) {
      return res.status(400).json({ message: 'Invalid email or password' });
    }

    



    const userData = {
      email: user.email,
      name: user.name,
      isActive: user.isActive,
      isFaculty: user.isFaculty, 
      isAdmin: user.isAdmin,
      rollNo: user.rollNo,
    };

    console.log("User data prepared:", userData);


    const token = await createToken(userData);

    delete userData.secret_key;

    res.status(200).json({
      message: 'Login successful',
      token,
      user: userData,  
    });
  } catch (error) {
    console.error('Error logging in user:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

  


  const verifyMainToken = async (req, res) => {
    try {
      const { email } = req.body;
      console.log('Incoming request body:', req.body);
  
      // Find user by email
      const user = await User.findOne({ email: req.body.email });
      console.log('Fetched user from database:', user);
  
      if (!user) {
        return res.status(401).json({
          message: 'User not found',
        });
      }
  
  
 
      return res.status(200).json({
        status: 200,
        message: 'Token is valid',
        user: {
          email: email,
          name: user.name,
          rollNo: user.rollNo,

        },
      });
    } catch (err) {
      console.error('Token verification error:', err);
      res.status(401).json({
        message: 'Invalid or expired token',
      });
    }
  };


// Function to register and send mail
const registerUser = async (req, res) => {
  try {
    const { email, name, phoneNo,isFaculty } = req.body;  
    const type = "user";
    console.log('Email received:', email);
    console.log('Phone number received:', phoneNo);


    if (!email || !name || !phoneNo) {
      console.log('Missing email, name, or phone number');
      return res.status(400).json({ message: 'Email, name, and phone number are required' });
    }


    const phoneRegex = /^[0-9]{10}$/;
    if (!phoneRegex.test(phoneNo)) {
      console.log('Invalid phone number format');
      return res.status(400).json({ message: 'Phone number must be exactly 10 digits' });
    }


    console.log('Checking if email already exists');
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      console.log('Email already exists:', email);
      return res.status(400).json({ message: 'Email already exists' });
    }

  
    console.log('Creating new user instance with email:', email);
    await sendregisterEmail(email, name, phoneNo,isFaculty, type);  


    res.status(200).json({
      status: 200,
      message: 'Email printed to console and email sent',
      email,
      phoneNo,
    });
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

  
  
  
  // Function to user set the password
  const createuserandPassword = async (req, res) => {
    try {
      const { email, password, name, phoneNo } = req.body;
  
      console.log('Received email:', email);
      console.log('Received password:', password);
      console.log('Received name:', name);
      console.log('Received phoneNo:', phoneNo);
  
    
      if (!email || !password || !name || !phoneNo) {
        console.log('Missing required fields');
        return res.status(400).json({ message: 'Email, password, name, and phone number are required' });
      }
  
     
      const emailRegex = /^(cb\.en\.[a-zA-Z0-9]+)@/; 
      const match = email.match(emailRegex);
  
      if (!match) {
        console.log('Invalid email format for roll number extraction');
        return res.status(400).json({ message: 'Invalid email format' });
      }
  
      const rollNo = match[1]; 
  
      console.log('Extracted roll number:', rollNo);
  

      const existingUser = await User.findOne({ email });
      if (existingUser) {
        console.log('Email already exists:', email);
        return res.status(400).json({ message: 'Email already exists' });
      }
  

      const phoneRegex = /^[0-9]{10}$/;
      if (!phoneRegex.test(phoneNo)) {
        console.log('Invalid phone number format');
        return res.status(400).json({ message: 'Phone number must be exactly 10 digits' });
      }
  

      const hashedPassword = await bcrypt.hash(password, 10); 
      console.log('Password hashed successfully');

      console.log('Creating new user with email:', email);
      const newUser = new User({
        email,
        password: hashedPassword,
        name,
        rollNo, 
        phoneNo, 
      });
  

      console.log('Saving new user to the database');
      await newUser.save();
      console.log('User saved successfully:', newUser);
  

      return res.status(201).json({
        status: 200,
        message: 'User created successfully',
        user: {
          email: newUser.email,
          name: newUser.name,
          rollNo: newUser.rollNo,
        },
      });
  
    } catch (error) {
      console.error('Error in setPassword:', error);
      return res.status(500).json({ message: 'Server error' });
    }
  };
  
  
  // Function to forgot password and send mail
  const forgotPassword = async (req, res) => {
    try {
      const { email } = req.body;
  
      console.log('email received:', email);
  
      // Check if the email is provided
      if (!email) {
        console.log('Missing email');
        return res.status(400).json({ message: 'email is required' });
      }
  
      // Find the user by email
      const existingUser = await User.findOne({ email });
      if (!existingUser) {
        console.log('email does not exist');
        return res.status(400).json({ message: 'email does not exist' });
      }
  
      // Get the user's name
      const { name } = existingUser;
  
      console.log('Sending email to:', email, 'with name:', name);
      
      // Call the sendEmail function and pass the email and name
      await sendforgotEmail(email, name);
  
      // Respond with a success message
      res.status(200).json({
        status: 200,
        message: 'email printed to console and email sent',
        email,
      });
    } catch (error) {
      console.error('Error:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  };


  // Function to reset user password
  const resetPassword = async (req, res) => {
    try {
      const { password, email } = req.body;
      console.log('resetPassword');
      console.log('Received email:', email);
      console.log('Received password:', password);
  
      // Check if both email and password are provided
      if (!email || !password) {
        console.log('Missing email or password');
        return res.status(400).json({ message: 'Email and password are required' });
      }
  
      const existingUser = await User.findOne({ email });
      if (!existingUser) {
        console.log('Email does not exist');
        return res.status(400).json({ message: 'Email does not exist' });
      }
  
      // Hash the new password before saving it
      const hashedPassword = await bcrypt.hash(password, 10); // 10 is the salt rounds
  
      // Update the user's password with the hashed version
      existingUser.password = hashedPassword;
  
      // Save the updated user to the database
      await existingUser.save();
      console.log('Password updated successfully:', existingUser);
  
      return res.status(200).json({
        status: 200,
        message: 'Password updated successfully',
        user: {
          email: existingUser.email,
          name: existingUser.name,
        }
      });
    } catch (error) {
      console.error('Error in resetPassword:', error);
      return res.status(500).json({ message: 'Server error' });
    }
  };
  
  


  
module.exports = { loginUser, verifyToken , registerUser,createuserandPassword ,forgotPassword,resetPassword, verifyMainToken  };