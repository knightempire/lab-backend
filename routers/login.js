// routes/user.js
const express = require('express');
const login = express.Router();  
const { loginUser, verifyToken, registerUser, createuserandPassword, resetPassword, forgotPassword, verifyMainToken, refreshAccessToken } = require('../controllers/login.contollers');
const {tokenValidator,verifyRegisterToken,verifyForgotToken,readverifyRegisterTokens, readverifyForgotToken} = require('../middleware/auth/tokenvalidate');


login.post('/login', loginUser);
login.post('/refresh-token', refreshAccessToken); // <-- add this route
login.get('/verify-token', tokenValidator, verifyMainToken);


login.get('/verify-token-forgot',  readverifyForgotToken, verifyToken);
login.get('/verify-token-register',readverifyRegisterTokens , verifyToken);


login.post('/register',registerUser);
login.post('/password', verifyRegisterToken, createuserandPassword);

login.post('/forgotpassword',forgotPassword,)
login.post('/resetpassword', verifyForgotToken, resetPassword);



module.exports = login;