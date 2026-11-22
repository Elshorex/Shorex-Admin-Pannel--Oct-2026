import mongoose from "mongoose";
import config from "../src/config.js";
import User from "../src/models/user.model/user.model.js";

const currentEmail = (process.argv[2] || "").trim().toLowerCase();
const newEmail = (process.argv[3] || "").trim().toLowerCase();

if (!currentEmail || !newEmail) {
  console.error("Usage: node scripts/change-user-email.mjs <currentEmail> <newEmail>");
  process.exit(1);
}

await mongoose.connect(config.mongoUrl);

const user = await User.findOne({
  email: new RegExp(`^${currentEmail.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}$`, "i"),
  deleted: false,
});

if (!user) {
  console.error(`No active user found with email: ${currentEmail}`);
  process.exit(1);
}

const duplicate = await User.findOne({
  email: newEmail,
  deleted: false,
  _id: { $ne: user._id },
});

if (duplicate) {
  console.error(`Cannot update: ${newEmail} is already used by user id ${duplicate._id} (${duplicate.type})`);
  process.exit(1);
}

console.log("Found user:", {
  id: user._id,
  name: user.name,
  type: user.type,
  currentEmail: user.email,
});

user.email = newEmail;
await user.save();

console.log("Updated successfully:", {
  id: user._id,
  type: user.type,
  newEmail: user.email,
});

await mongoose.disconnect();
