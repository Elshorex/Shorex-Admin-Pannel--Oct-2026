import mongoose from "mongoose";
import config from "../src/config.js";
import { sendOtpEmail } from "../src/services/sendMail.js";

// Optional: pass any email to simulate the user; delivery goes to POSTMARK_FROM_EMAIL in test mode
const testEmail = process.argv[2] || "moomantest@gmail.com";
const deliveryEmail = config.postmarkSameDomainTest
  ? config.postmarkFromEmail
  : testEmail;

try {
  await mongoose.connect(config.mongoUrl);
  console.log(`Sending OTP test email (user: ${testEmail}, delivery: ${deliveryEmail})...`);
  await sendOtpEmail(testEmail, "en");
  console.log("✅ OTP email sent successfully");
} catch (error) {
  console.error("❌ Failed to send OTP email:", error.message || error);
  process.exitCode = 1;
} finally {
  await mongoose.disconnect();
}