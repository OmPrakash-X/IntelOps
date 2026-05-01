import mongoose from "mongoose";
import User from "../models/user.model.js";
import { config }  from "../config/config.js";

const MONGO_URI = config.MONGO_URI;

const createAdmin = async () => {
  try {

    await mongoose.connect(MONGO_URI);
    console.log("DB connected");

    const existingAdmin = await User.findOne({ role: "admin" });

    if (existingAdmin) {
      console.log("Admin already exists");
      process.exit(0);
    }

    await User.create({
      username: "admin",
      email: "admin@intelops.com",
      password: "admin123",
      role: "admin",
      avatar: '../public/Admin-Profile-Pic.jpg'
    });

    console.log("Admin created successfully");
    process.exit(0);

  } catch (error) {
    console.error("Error creating admin:", error.message);
    process.exit(1);
  }
};

createAdmin();