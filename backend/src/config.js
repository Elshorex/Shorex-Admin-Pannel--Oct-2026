import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

const __configDir = path.dirname(fileURLToPath(import.meta.url));
const __backendRoot = path.resolve(__configDir, "..");

dotenv.config({ path: path.join(__backendRoot, ".env") });
dotenv.config({ path: path.join(__backendRoot, ".env.postmark"), override: true });

const config = {};
let NODE_ENV = process.env.NODE_ENV || "production";
console.log("NODE_ENV ", NODE_ENV);
config.NODE_ENV = NODE_ENV;

config.mongoUrl =
  process.env.MONGODB_URI ||
  process.env.MONGO_URL ||
  "mongodb://127.0.0.1:27017/Shorex-App";

config.jwtSecret = process.env.JWT_SECRET || "Shorex-App";
config.confirmMessage = "verify code:";
config.App = { Name: "Shorex-App" };
config.GoogleApiKey = process.env.GOOGLE_API_KEY || "";
config.twilioAccountSID = process.env.TWILIO_ACCOUNT_SID || "";
config.twilioAuthToken = process.env.TWILIO_AUTH_TOKEN || "";
config.twilioServiceSID = process.env.TWILIO_SERVICE_SID || "";
config.postmarkApiToken = process.env.POSTMARK_SERVER_API_TOKEN || "";
config.postmarkFromEmail = process.env.POSTMARK_FROM_EMAIL || "no-reply@shorex.app";
config.postmarkMessageStream = process.env.POSTMARK_MESSAGE_STREAM || "outbound";
config.postmarkSameDomainTest = process.env.POSTMARK_SAME_DOMAIN_TEST === "true";

if (!config.postmarkApiToken) {
  console.warn(
    "[Postmark] POSTMARK_SERVER_API_TOKEN is missing. OTP emails will fail until .env or .env.postmark is set on the server."
  );
}
config.backend_endpoint = "https://shorex.app/shorex-Backend";
config.webUrl = "https://shorex.app/";

config.cloudinary = {
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME || "",
  api_key: process.env.CLOUDINARY_API_KEY || "",
  api_secret: process.env.CLOUDINARY_API_SECRET || "",
  secure: true,
  folder: "shorex_uploads",
};

config.webUrls = {
  test: {
    resetLink: process.env.WEB_RESET_URL_TEST || "",
  },
  production: {
    resetLink: process.env.WEB_RESET_URL || "",
  },
}[NODE_ENV];
config.webUrls.forgetPassword = config.webUrls.resetLink;

config.SECRET_KEY = process.env.SECRET_KEY || "shorex-email";
config.notificationTitle = {
  ar: "شوريكس",
  en: "Hi Shorex",
  es: "Hi Shorex",
};

config.locals = ["en", "ar", "es"];
config.types = ["ADMIN", "SUB_ADMIN", "CLIENT", "PROVIDER", "STORE_KEEPER", "DRIVER"];
config.roles = {
  ADMIN: 1,
  SUB_ADMIN: 2,
  PROVIDER: 3,
  STORE_KEEPER: 4,
  CLIENT: 5,
  DRIVER: 6,
};

config.status = {
  active: 1,
  inactive: 2,
};

config.payment = {
  test: {
    host: "test.oppwa.com",
    authToken: process.env.PAYMENT_TEST_AUTH_TOKEN || "",
    cardEntityId: process.env.PAYMENT_TEST_CARD_ENTITY_ID || "",
    madaEntityId: process.env.PAYMENT_TEST_MADA_ENTITY_ID || "",
    appleEntityId: process.env.PAYMENT_TEST_APPLE_ENTITY_ID || "",
    stcEntityId: process.env.PAYMENT_TEST_STC_ENTITY_ID || "",
    currency: "SAR",
    paymentType: "DB",
    notificationUrl: "https://www.shorex-hi.com/Shorex-Backend/payment/notify",
    testMode: "EXTERNAL",
  },
  production: {
    host: "oppwa.com",
    authToken: process.env.PAYMENT_AUTH_TOKEN || "",
    cardEntityId: process.env.PAYMENT_CARD_ENTITY_ID || "",
    madaEntityId: process.env.PAYMENT_MADA_ENTITY_ID || "",
    appleEntityId: process.env.PAYMENT_APPLE_ENTITY_ID || "",
    stcEntityId: process.env.PAYMENT_STC_ENTITY_ID || "",
    currency: "SAR",
    paymentType: "DB",
    notificationUrl: "https://www.shorex-hi.com/Shorex-Backend/payment/notify",
    testMode: "EXTERNAL",
  },
}[NODE_ENV];

export default config;
