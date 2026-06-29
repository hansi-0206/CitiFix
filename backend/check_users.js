import mongoose from "mongoose";
import dotenv from "dotenv";
import User from "./models/User.js";
import bcrypt from "bcryptjs";

dotenv.config();

const checkUsers = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log("Connected to MongoDB");

    const users = await User.find({});
    console.log(`Found ${users.length} users:`);
    for (const u of users) {
      console.log(`- Email: ${u.email}, Role: ${u.role}, Name: ${u.name}`);
      
      // Test standard passwords
      const testPasswords = ["Officer@123", "Admin@123", "password", "password123"];
      for (const p of testPasswords) {
        const isMatch = await bcrypt.compare(p, u.password);
        if (isMatch) {
          console.log(`  -> Password matches "${p}"`);
        }
      }
    }
    
    await mongoose.disconnect();
  } catch (error) {
    console.error("Error:", error);
  }
};

checkUsers();
