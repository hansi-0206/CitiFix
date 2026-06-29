import "./env.js";
import mongoose from "mongoose";
import User from "../models/User.js";

const seedAdminAndOfficer = async () => {
  try {
    const officerEmail = "officer@citifix.gov";
    let officerExists = await User.findOne({ email: officerEmail });
    if (!officerExists) {
      await User.create({
        name: "Municipal Officer",
        email: officerEmail,
        password: "Officer@123",
        role: "Officer",
        points: 50,
      });
      console.log(`[SEED] Created Municipal Officer account (${officerEmail})`);
    } else {
      officerExists.password = "Officer@123";
      await officerExists.save();
      console.log(`[SEED] Municipal Officer password updated successfully (${officerEmail})`);
    }

    const adminEmail = "admin@citifix.gov";
    let adminExists = await User.findOne({ email: adminEmail });
    if (!adminExists) {
      await User.create({
        name: "System Administrator",
        email: adminEmail,
        password: "Admin@123",
        role: "Admin",
        points: 100,
      });
      console.log(`[SEED] Created System Administrator account (${adminEmail})`);
    } else {
      adminExists.password = "Admin@123";
      await adminExists.save();
      console.log(`[SEED] System Administrator password updated successfully (${adminEmail})`);
    }
  } catch (error) {
    console.error(`[SEED ERROR] Failed to seed officer/admin accounts: ${error.message}`);
  }
};

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI);
    console.log(`MongoDB Connected: ${conn.connection.host}`);
    await seedAdminAndOfficer();
  } catch (error) {
    console.error(`MongoDB Connection Error: ${error.message}`);
    process.exit(1);
  }
};

export default connectDB;
