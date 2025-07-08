// controllers/login.contollers.js
require('dotenv').config();

const bcrypt = require('bcryptjs');
const User = require('../models/user.model'); 
const Token = require('../models/token.model');
const { createToken, createRefreshToken } = require('../middleware/auth/tokencreation'); 
const {sendregisterEmail,sendforgotEmail} = require('../middleware/mail/mail'); 
const moment = require('moment-timezone'); 
const jwt = require('jsonwebtoken');



const verifyToken = async (req, res) => {
  try {
    const { email, name } = req.body;
    if (!email || !name) {
      return res.status(400).json({
        message: 'Email and name are required',
      });
    }

    // Extract rollNo from email if it's not provided
    let rollNo = req.body.rollNo;
    if (!rollNo && email) {
    
      const emailPrefix = email.split('@')[0];
      rollNo = emailPrefix; 
    }

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
    const { email, password, rememberme } = req.body;

    console.log('Login request received:', { email, rememberme });
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: 'Invalid email' });
    }

    if (!user.isActive) {
      return res.status(400).json({ message: 'User is inactive. Please contact support.' });
    }

    const isPasswordMatch = await bcrypt.compare(password, user.password);
    if (!isPasswordMatch) {
      return res.status(400).json({ message: 'Invalid  password' });
    }

    const userData = {
      userid: user._id,
      email: user.email,
      name: user.name,
      isActive: user.isActive,
      isFaculty: user.isFaculty, 
      isAdmin: user.isAdmin,
      rollNo: user.rollNo,
    };

    const token = await createToken(userData); 
    const refreshToken = createRefreshToken(userData,rememberme); 

    console.log("node env", process.env.NODE_ENV);

    // Set refresh token in HTTP-only cookie
    const cookieOptions = {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
    };
    if (rememberme) {
      cookieOptions.maxAge = 30 * 24 * 60 * 60 * 1000; // 30 days
    }
    // If rememberme is false, do not set maxAge (session cookie)

    res.cookie('refreshToken', refreshToken, cookieOptions);

    console.log('Cookie options:', cookieOptions);
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
          isFaculty: user.isFaculty,
          isAdmin: user.isAdmin,
          isActive: user.isActive,

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
      message: 'Successfully email sent to user',
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
      console.log('createuserandPassword function called');
      const { email, password, name, phoneNo ,isFaculty} = req.body;
  
      console.log('Received email:', email);
      console.log('Received password:', password);
      console.log('Received name:', name);
      console.log('Received phoneNo:', phoneNo);
      console.log('Received isFaculty:', isFaculty);
  
      if (!email || !password || !name || !phoneNo) {
        console.log('Missing required fields');
        return res.status(400).json({ message: 'Email, password, name, and phone number are required' });
      }
  
      // Regex to match the part before the @ symbol in the email
      const emailRegex = /^([a-zA-Z0-9._%+-]+)@/;
      const match = email.match(emailRegex);
  
      if (!match) {
        console.log('Invalid email format for extracting roll number');
        return res.status(400).json({ message: 'Invalid email format' });
      }
  
      const rollNo = match[1];  // Capture the part before @ as roll number
  
      console.log('Extracted roll number:', rollNo);
  
      // Check if user already exists
      const existingUser = await User.findOne({ email });
      if (existingUser) {
        console.log('Email already exists:', email);
        return res.status(400).json({ message: 'Email already exists' });
      }
  

      // Hash the password
      const hashedPassword = await bcrypt.hash(password, 10); 
      console.log('Password hashed successfully');
  
    const formattedName = name.charAt(0).toUpperCase() + name.slice(1).toLowerCase();
    console.log('Formatted name:', formattedName);
    
      console.log('Creating new user with email:', email);
      const newUser = new User({
        email,
        password: hashedPassword,
         name: formattedName,
        rollNo,  
        phoneNo, 
        isFaculty,
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
  
     
      if (!email) {
        console.log('Missing email');
        return res.status(400).json({ message: 'email is required' });
      }
  

      const existingUser = await User.findOne({ email });
      if (!existingUser) {
        console.log('email does not exist');
        return res.status(400).json({ message: 'email does not exist' });
      }
  

      const { name } = existingUser;
  
      console.log('Sending email to:', email, 'with name:', name);
      

      await sendforgotEmail(email, name);

      res.status(200).json({
        status: 200,
        message: 'Successfully email sent to user',
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
  

      if (!email || !password) {
        console.log('Missing email or password');
        return res.status(400).json({ message: 'Email and password are required' });
      }
  
      const existingUser = await User.findOne({ email });
      if (!existingUser) {
        console.log('Email does not exist');
        return res.status(400).json({ message: 'Email does not exist' });
      }
  

      const hashedPassword = await bcrypt.hash(password, 10); 
  

      existingUser.password = hashedPassword;
  

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
  
  
  const refreshAccessToken = async (req, res) => {
  // Get refresh token from cookie
  console.log('refreshAccessToken function called');
  console.log('Cookies:', req.cookies);
  const refreshToken = req.cookies.refreshToken;
  if (!refreshToken) return res.status(401).json({ message: 'Refresh token required' });

  try {
    const userData = jwt.verify(refreshToken, process.env.REFRESH_SECRET_KEY);
    const token = await createToken(userData); // new PASETO access token
    res.json({ token });
  } catch (err) {
    return res.status(403).json({ message: 'Invalid or expired refresh token' });
  }
};



  
module.exports = { loginUser, verifyToken , registerUser,createuserandPassword ,forgotPassword,resetPassword, verifyMainToken , refreshAccessToken };

