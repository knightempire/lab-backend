require('dotenv').config();
const Token = require("../../models/token.model");
const paseto = require('paseto');
const { V4: { sign } } = paseto;
const jwt = require('jsonwebtoken'); // <-- Add this line
const fs = require('fs');
const path = require('path');

const refresh_secret_key = process.env.REFRESH_SECRET_KEY;
const refreshExpiresIn = process.env.REFRESH_EXPIRES_IN || '7d'; // fallback to 7d if not set
const secret_key = process.env.SECRET_KEY;
const mail_secret_key = process.env.MAIL_SECRET_KEY;
const forgot_secret_key = process.env.FORGOT_SECRET_KEY;
const expiresIn = process.env.EXPIRES_IN;  
const mailexpiresIn = process.env.MAIL_EXPIRES_IN;  


const private_key_path = path.resolve(__dirname, '../rsa/private_key.pem');

function getPrivateKey() {
    try {
        return fs.readFileSync(private_key_path);
    } catch (err) {
        console.warn(`⚠️ Private key not found or unreadable at ${private_key_path}. Using fallback value "123".`);
        return '123';
    }
}

async function createToken(data) {
    if (!secret_key) {
        throw new Error('SECRET_KEY is not defined in the environment variables.');
    }

    data.secret_key = secret_key;
 const private_key = getPrivateKey();

    let token = await sign(data, private_key, { expiresIn: expiresIn });  

    return token;
}

// --- ADD THIS FUNCTION ---
function createRefreshToken(data) {
    if (!refresh_secret_key) {
        throw new Error('REFRESH_SECRET_KEY is not defined in the environment variables.');
    }
    // Do not include sensitive info in refresh token
    const payload = { ...data };
    delete payload.secret_key;
    return jwt.sign(payload, refresh_secret_key, { expiresIn: refreshExpiresIn });
}
// --- END ADD ---

async function registermailtoken(data) {
    if (!mail_secret_key) {
        throw new Error('MAIL_SECRET_KEY is not defined in the environment variables.');
    }

    console.log("registermailtoken")

    data.secret_key = mail_secret_key;

    const newToken = new Token({
        token: "123", 
        email: data.email,
    });

    const savedToken = await newToken.save();

    console.log('Token ID:', savedToken._id);

    data.tokenId = savedToken._id;

    const private_key = getPrivateKey(); 
    let token = await sign(data, private_key, { expiresIn: mailexpiresIn });


    savedToken.token = token; 
    await savedToken.save();  


    console.log('Updated Token:', savedToken);

    return token;
}

async function forgotmailtoken(data) {
    if (!forgot_secret_key) {
        throw new Error('FORGOT_SECRET_KEY is not defined in the environment variables.');
    }
    console.log("forgotmailtoken")

    data.secret_key = forgot_secret_key;

    console.log("forgotmailtoken data",data)
    const newToken = new Token({
        token: "123", 
        email: data.email,
    });

    
    const savedToken = await newToken.save();


    console.log('Token ID:', savedToken._id);

    data.tokenId = savedToken._id;
        const private_key = getPrivateKey(); 
    let token = await sign(data, private_key, { expiresIn: mailexpiresIn });


    savedToken.token = token; 
    await savedToken.save();  


    console.log('Updated Token:', savedToken);

    return token;
}


module.exports = { createToken, createRefreshToken, registermailtoken , forgotmailtoken};