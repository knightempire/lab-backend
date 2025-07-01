const express = require("express");
const dotenv = require("dotenv");
const cors = require("cors");
const { connectToDb, getDb } = require("./config/db.js");
const { ed25519KeygenMiddleware } = require("./middleware/rsa/key.js");
const productRoutes = require('./routers/product');
const userRoutes = require('./routers/user');
const requestRoutes = require('./routers/request');
const returnRoutes = require('./routers/return');
const referenceRoutes = require('./routers/reference');
const damagedRoutes = require('./routers/damaged');
const loginRoutes = require('./routers/login');
const reIssuedRoutes = require('./routers/reIssued.js');
const dashboardRoutes = require('./routers/dashboard');
const notificationRoutes = require('./routers/notification');
const cookieParser = require('cookie-parser');

dotenv.config();

const port = process.env.PORT || 3002;

const app = express();

app.use(cors({
    origin: true,           // Allow all origins
    credentials: true       // Allow cookies/credentials
}));
app.use(express.json());
app.use(cookieParser());

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
app.use('/api/request', returnRoutes);
app.use('/api/reference', referenceRoutes);
app.use('/api/damaged', damagedRoutes);
app.use('/api/reIssued', reIssuedRoutes);
app.use('/api/dashboard', dashboardRoutes);
// app.use('/api/notification', notificationRoutes);
app.use('/api/', loginRoutes);

connectToDb().then(() => {
    app.listen(port, () => {
        console.log(`Server is running on http://localhost:${port}`);
    });
}).catch(err => {
    console.error('Failed to connect to MongoDB:', err);
});
