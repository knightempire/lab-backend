import mongoose from "mongoose";

let db;

const connectToDb = async () => {
  const uri = process.env.MONGODB_URI;
  try {
    const conn = await mongoose.connect(uri);
    db = conn.connection;
    console.log(`Connected to ${db.host}`);
  } catch (err) {
    console.error('Error connecting to MongoDB:', err);
  }
};

const getDb = () => {
  if (!db) {
    throw new Error('Database not initialized');
  }
  return db;
};

export { connectToDb, getDb };