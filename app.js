import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import { connectToDb, getDb } from './config/db.js';

dotenv.config();

const port = process.env.PORT || 3000;

const app = express();

app.use(cors());

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
