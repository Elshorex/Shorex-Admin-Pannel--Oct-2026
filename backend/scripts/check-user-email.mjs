import mongoose from "mongoose";
import config from "../src/config.js";
import User from "../src/models/user.model/user.model.js";

const email = (process.argv[2] || "").trim().toLowerCase();

await mongoose.connect(config.mongoUrl);
const user = await User.findOne({ email, deleted: false });
if (!user) {
  console.log(`No user found for: ${email}`);
} else {
  console.log(`Found user: type=${user.type}, name=${user.name || "(no name)"}`);
}
await mongoose.disconnect();
