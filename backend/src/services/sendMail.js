import ConfirmationCode from "../models/confirmationsCodes.model/confirmationscodes.model.js";
import config from "../config.js";
import { getPostmarkClient, isPostmarkConfigured } from "./postmarkClient.js";

export const sendEmail = async (to, subject, html, text) => {
  const postmarkClient = getPostmarkClient();
  if (!postmarkClient) {
    console.error(
      "[Postmark] Missing POSTMARK_SERVER_API_TOKEN — check .env and .env.postmark on server"
    );
    throw new Error(
      "Postmark is not configured. Set POSTMARK_SERVER_API_TOKEN in your environment."
    );
  }

  try {
    await postmarkClient.sendEmail({
      From: config.postmarkFromEmail,
      To: to,
      Subject: subject,
      HtmlBody: html,
      TextBody: text || html.replace(/<[^>]+>/g, ""),
      MessageStream: config.postmarkMessageStream,
    });
    console.log("✅ Email sent successfully via Postmark");
  } catch (error) {
    console.error("❌ Postmark Email Error:", error.message || error);
    if (error.statusCode) console.error("Status:", error.statusCode);
    throw new Error("Failed to send email");
  }
};

export const sendOtpEmail = async (email, lang) => {
  const otp = Math.floor(100000 + Math.random() * 900000);
  const normalizedEmail = email.trim().toLowerCase();

  await ConfirmationCode.create({
    email: normalizedEmail,
    code: String(otp),
    type: "EMAIL",
    verified: false,
  });

  const subject = "Your Shorex Verification Code";
  const deliveryEmail = config.postmarkSameDomainTest
    ? config.postmarkFromEmail
    : normalizedEmail;
  const testNote = config.postmarkSameDomainTest
    ? `<p><em>Test mode: OTP requested for ${normalizedEmail}</em></p>`
    : "";
  const html = `
    <h2>Your Verification Code</h2>
    ${testNote}
    <p>Use this code to verify your email: <strong>${otp}</strong></p>
    <p>This code will expire in 10 minutes.</p>
  `;

  if (config.postmarkSameDomainTest && deliveryEmail !== normalizedEmail) {
    console.log(
      `📧 Postmark test mode: delivering OTP to ${deliveryEmail} (requested for ${normalizedEmail})`
    );
  }

  await sendEmail(deliveryEmail, subject, html);
};

export { isPostmarkConfigured };
