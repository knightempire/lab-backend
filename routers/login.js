// routes/user.js
const express = require('express');
const user = express.Router();  
const { loginUser, verifyToken,registerUser, createuserandPassword ,resetPassword , forgotPassword,verifyMainToken } = require('../controllers/login.contollers');
const {tokenValidator,verifyRegisterToken,verifyForgotToken,readverifyRegisterTokens, readverifyForgotToken} = require('../middleware/auth/tokenvalidate');


user.post('/login', loginUser);
user.post('/verify-token', tokenValidator, verifyMainToken);


user.get('/verify-token-forgot',  readverifyForgotToken, verifyToken);
user.get('/verify-token-register',readverifyRegisterTokens , verifyToken);


user.post('/register',registerUser);
user.post('/password', verifyRegisterToken, createuserandPassword);

user.post('/forgotpassword',forgotPassword,)
user.post('/resetpassword', verifyForgotToken, resetPassword);



module.exports = user;