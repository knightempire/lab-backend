
require('dotenv').config();
const Token = require("../../models/token");
const paseto = require('paseto');
const { V4: { verify } } = paseto;
const fs = require('fs');
const path = require('path');

// Load the public key from the file
const public_key_path = path.resolve(__dirname, '../rsa/public_key.pem');
const public_key = fs.readFileSync(public_key_path);

// Environment variables for secret keys
const secret_key = process.env.SECRET_KEY;
const mail_secret_key = process.env.MAIL_SECRET_KEY;
const forgot_secret_key = process.env.FORGOT_SECRET_KEY;

// Token verification for "create" token
async function tokenValidator(req, res, next) {
    console.log("tokenValidator")
    const tokenHeader = req.headers.authorization;
    const token = tokenHeader && tokenHeader.split(' ')[1];

    if (!token) {
        console.log("No token provided"); 
        return res.status(401).send({ MESSAGE: 'Missing or invalid token.' });
    }

    try {
        const payload = await verify(token, public_key);  

        // Ensure payload contains required fields
        if (payload && payload.secret_key === secret_key) {
            // Attach payload data to req.body
            req.body.email = payload.email;
            req.body.userId = payload.id;
            req.body.name = payload.name;
            req.body.username = payload.username;
            req.body.role = payload.role;

            // Log the payload to verify it's correct
            console.log("Token payload:", payload);
            console.log("User details added to request body:"); 
            return next();  

        } else {
            console.log("Invalid token payload:", payload); 
            return res.status(401).send({ MESSAGE: 'Invalid token payload.' });
        }
    } catch (err) {
        
        return res.status(401).send({ MESSAGE: 'Invalid or expired token: ' + err.message });
    }
}

// Token verification for "create" token
async function adimtokenValidator(req, res, next) {
    console.log("admintokenValidator")
    const tokenHeader = req.headers.authorization;
    const token = tokenHeader && tokenHeader.split(' ')[1];

    if (!token) {
        console.log("No token provided"); 
        return res.status(401).send({ MESSAGE: 'Missing or invalid token.' });
    }

    try {
        const payload = await verify(token, public_key);  

        // Ensure payload contains required fields
        if (payload && payload.secret_key === secret_key) {

            req.body.email = payload.email;
            req.body.userId = payload.id;
            req.body.name = payload.name;
            req.body.username = payload.username;
            req.body.role = payload.role;

            // Log the payload to verify it's correct
            console.log("Token payload:", payload);
            console.log("User details added to request body:"); 
            console.log("User role:", payload.role);
            if(payload.role !== "admin") {
                return res.status(401).send({ MESSAGE: 'You are not authorized to access this resource.' });
            }
            return next(); 

        } else {
            console.log("Invalid token payload:", payload); 
            return res.status(401).send({ MESSAGE: 'Invalid token payload.' });
        }
    } catch (err) {
        console.error("Token verification error:", err.message); 
        return res.status(401).send({ MESSAGE: 'Invalid or expired token: ' + err.message });
    }
}



// Token verification for "register" token
async function readverifyRegisterTokens(req, res, next) {
    // Retrieve the token from the Authorization header
    const tokenHeader = req.headers.authorization;
    const token = tokenHeader && tokenHeader.split(' ')[1];

    console.log("Received token:", token); 


    if (!token) {
        return res.status(401).send({ MESSAGE: 'Missing or invalid token.' });
    }

    try {
        // Check if the token exists in the database
        const existingToken = await Token.findOne({ token });
        console.log("Token found in database:", existingToken);

        if (!existingToken) {
            return res.status(401).send({ MESSAGE: 'Token not found in database or has already been used.' });
        }


        const payload = await verify(token, public_key);
        console.log("Decoded payload:", payload); 

        if (payload && payload.secret_key === mail_secret_key) {

            req.body = req.body || {};  

            req.body.email = payload.email;
            req.body.userId = payload.id;
            req.body.name = payload.name;

            console.log("User details added to request body:", req.body); 


            next();
        } else {
 
            return res.status(401).send({ MESSAGE: 'Invalid token payload.' });
        }
    } catch (err) {
    
        console.error("Error verifying token:", err.message); 
        return res.status(401).send({ MESSAGE: 'Invalid or expired token: ' + err.message });
    }
}



// Token verification for "forgot" token

async function readverifyForgotToken(req, res, next) {
    // Retrieve the token from the Authorization header
    const tokenHeader = req.headers.authorization;
    const token = tokenHeader && tokenHeader.split(' ')[1];

    console.log("Received token:", token); 

    if (!token) {
        return res.status(401).send({ MESSAGE: 'Missing or invalid token.' });
    }

    try {

        const existingToken = await Token.findOne({ token });
        console.log("Token found in database:", existingToken); 


        if (!existingToken) {
            return res.status(401).send({ MESSAGE: 'Token not found in database or has already been used.' });
        }


        const payload = await verify(token, public_key);
        console.log("Decoded payload:", payload);

        console.log("Decoded are ", )
        if (payload && payload.secret_key === forgot_secret_key) {

            req.body = req.body || {};  

            req.body.email = payload.email;
            req.body.userId = payload.id;
            req.body.name = payload.name;

            console.log("User details added to request body:", req.body);

            next();
        } else {

            return res.status(401).send({ MESSAGE: 'Invalid token payload.' });
        }
    } catch (err) {
  
        console.error("Error verifying token:", err.message); 

        return res.status(401).send({ MESSAGE: 'Invalid or expired token: ' + err.message });
    }
}






// Token verification for "register" token
async function verifyRegisterToken(req, res, next) {
    const tokenHeader = req.headers.authorization;
    const token = tokenHeader && tokenHeader.split(' ')[1];

    if (!token) {
        return res.status(401).send({ MESSAGE: 'Missing or invalid token.' });
    }

    try {
        const payload = await verify(token, public_key);

        if (payload && payload.secret_key === mail_secret_key) {
           
            const existingToken = await Token.findOne({ token });

            if (!existingToken) {
                return res.status(401).send({ MESSAGE: 'Token has already been used or expired.' });
            }

        
            req.body.email = payload.email;
            req.body.userId = payload.id;
            req.body.name = payload.name;
            await Token.deleteOne({ token });

            next();
        } else {
            return res.status(401).send({ MESSAGE: 'Invalid register token payload.' });
        }
    } catch (err) {
        return res.status(401).send({ MESSAGE: 'Invalid or expired register token: ' + err.message });
    }
}

// Token verification for "forgot" token
async function verifyForgotToken(req, res, next) {
    const tokenHeader = req.headers.authorization;
    const token = tokenHeader && tokenHeader.split(' ')[1];

    if (!token) {
        return res.status(401).send({ MESSAGE: 'Missing or invalid token.' });
    }

    try {
    
        const payload = await verify(token, public_key);
        
        // Check if the payload contains the correct secret_key
        if (payload && payload.secret_key === forgot_secret_key) {
            // Check if the token exists in the database
            const existingToken = await Token.findOne({ token });
            console.log(existingToken);
            if (!existingToken) {
                return res.status(401).send({ MESSAGE: 'Token has already been used or expired.' });
            }

            // Attach user information from the token payload to the request body
            req.body.email = payload.email;
            req.body.userId = payload.id;
            req.body.name = payload.name;

            // Delete the token from the database after use
            await Token.deleteOne({ token });

            // Proceed to the next middleware or route handler
            next();
        } else {
            return res.status(401).send({ MESSAGE: 'Invalid forgot token payload.' });
        }
    } catch (err) {
        // Handle the error when token is expired
        if (err.name === 'TokenExpiredError') {
            return res.status(401).send({ MESSAGE: 'Forgot token has expired.' });
        }


        return res.status(401).send({ MESSAGE: 'Invalid or expired forgot token: ' + err.message });
    }
}

module.exports = {
    tokenValidator,
    verifyRegisterToken,
    verifyForgotToken,
    readverifyForgotToken,
    readverifyRegisterTokens,
    adimtokenValidator
};