const express = require("express");
const dotenv = require("dotenv");
const cors = require("cors");
const { connectToDb, getDb } = require("./config/db.js");
const { ed25519KeygenMiddleware } = require("./middleware/rsa/key.js");

dotenv.config();

const port = process.env.PORT || 3000;

const app = express();

app.use(cors());

app.get('/generate-keys', ed25519KeygenMiddleware);

app.get('/', (req, res) => {
    const db = getDb();
    if (db) {
        console.log('Hi Dev The Database is connected.');
        res.send('Hi Dev The Database is connected.');
    } else {
        res.send('Hi Dev The Database is not connected.');
    }
});

connectToDb().then(() => {
    app.listen(port, () => {
        console.log(`Server is running on http://localhost:${port}`);
    });
}).catch(err => {
    console.error('Failed to connect to MongoDB:', err);
});
