import mongoose from "mongoose";
import dotenv from "dotenv";
dotenv.config();

const connectDB = async () => {
  mongoose.connection.on('connected', () => {
    console.log('✅ MongoDB is connected');
  });

  console.log("MONGODB_URL:", process.env.MONGODB_URL); // Debug line

  await mongoose.connect(`${process.env.MONGODB_URL}`);
};

export default connectDB;
