const express = require("express");
const dotenv = require("dotenv");
const cors = require("cors");
const { connectToDb, getDb } = require("./config/db.js");
const { ed25519KeygenMiddleware } = require("./middleware/rsa/key.js");
const productRoutes = require('./routers/product');
const userRoutes = require('./routers/user');
const requestRoutes = require('./routers/request');
const referenceRoutes = require('./routers/reference');
const damagedRoutes = require('./routers/damaged');
const loginRoutes = require('./routers/login');

dotenv.config();

const port = process.env.PORT || 3002;

const app = express();

app.use(cors());
app.use(express.json());

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

app.use(express.json());
app.use('/api/products', productRoutes);
app.use('/api/users', userRoutes);
app.use('/api/request', requestRoutes);
app.use('/api/reference', referenceRoutes);
app.use('/api/damaged', damagedRoutes);
app.use('/api/', loginRoutes);

connectToDb().then(() => {
    app.listen(port, () => {
        console.log(`Server is running on http://localhost:${port}`);
    });
}).catch(err => {
    console.error('Failed to connect to MongoDB:', err);
});
