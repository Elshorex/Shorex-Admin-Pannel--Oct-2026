import mongoose from "mongoose";
import config from "../src/config.js";

export const connectDB = async () => {
  try {
    await mongoose.connect(config.mongoUrl, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log("\x1b[32m%s\x1b[0m", "[DB] Seeder connected...");
  } catch (error) {
    console.error("\x1b[31m%s\x1b[0m", "[DB] Seeder connection failed:", error);
    // process.exit(1);
  }
};

export const disconnectDB = async () => {
  await mongoose.disconnect();
  console.log("\x1b[31m%s\x1b[0m", "[DB] Seeder disconnected...");
};
