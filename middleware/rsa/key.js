const nacl = require('tweetnacl');
const fs = require('fs');
const path = require('path');

function generateEd25519KeyPair() {
    const keyPair = nacl.sign.keyPair();
    return { publicKey: keyPair.publicKey, privateKey: keyPair.secretKey };
}

function ed25519KeygenMiddleware(req, res, next) {
    const privateKeyPath = path.join(__dirname, 'private_key.pem');
    const publicKeyPath = path.join(__dirname, 'public_key.pem');

    const privateExists = fs.existsSync(privateKeyPath);
    const publicExists = fs.existsSync(publicKeyPath);

    if (privateExists && publicExists) {
        req.ed25519Keys = {
            publicKey: fs.readFileSync(publicKeyPath),
            privateKey: fs.readFileSync(privateKeyPath)
        };
        return res.status(200).send('Ed25519 key already exists.');
    }

    const { publicKey, privateKey } = generateEd25519KeyPair();

    fs.writeFileSync(privateKeyPath, privateKey, 'binary');
    fs.writeFileSync(publicKeyPath, publicKey, 'binary');

    req.ed25519Keys = { publicKey, privateKey };
    return res.status(201).send('Ed25519 key pair created.');
}

module.exports = {ed25519KeygenMiddleware};
