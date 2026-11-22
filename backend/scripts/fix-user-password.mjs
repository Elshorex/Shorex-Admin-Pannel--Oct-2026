/**
 * One-off: set a user's password (hashed once). Usage:
 * node scripts/fix-user-password.mjs <email> <plainPassword> [type]
 */
import mongoose from "mongoose";
import config from "../src/config.js";
import User from "../src/models/user.model/user.model.js";
import { setUserPassword } from "../src/helpers/setUserPassword.js";

const email = (process.argv[2] || "").trim().toLowerCase();
const password = process.argv[3];
const type = process.argv[4];

if (!email || !password) {
  console.error("Usage: node scripts/fix-user-password.mjs <email> <password> [type]");
  process.exit(1);
}

await mongoose.connect(config.mongoUrl);
const query = { email, deleted: false };
if (type) query.type = type;

const user = await User.findOne(query);
if (!user) {
  console.error(`No user found for ${email}${type ? ` (type=${type})` : ""}`);
  process.exit(1);
}

await setUserPassword(user, password);
console.log(`Password updated for ${user.email} (${user.type})`);
await mongoose.disconnect();
