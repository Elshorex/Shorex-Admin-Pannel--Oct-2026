import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";
import postmark from "postmark";
import config from "../config.js";

const backendRoot = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  "..",
  ".."
);

let cachedClient = null;

export function reloadPostmarkEnv() {
  dotenv.config({ path: path.join(backendRoot, ".env") });
  dotenv.config({ path: path.join(backendRoot, ".env.postmark"), override: true });
  config.postmarkApiToken = process.env.POSTMARK_SERVER_API_TOKEN || "";
  config.postmarkFromEmail =
    process.env.POSTMARK_FROM_EMAIL || "no-reply@shorex.app";
  config.postmarkMessageStream =
    process.env.POSTMARK_MESSAGE_STREAM || "outbound";
  config.postmarkSameDomainTest =
    process.env.POSTMARK_SAME_DOMAIN_TEST === "true";
  cachedClient = null;
}

export function isPostmarkConfigured() {
  return Boolean(config.postmarkApiToken);
}

export function getPostmarkClient() {
  if (!config.postmarkApiToken) {
    reloadPostmarkEnv();
  }
  if (!config.postmarkApiToken) {
    return null;
  }
  if (!cachedClient) {
    cachedClient = new postmark.ServerClient(config.postmarkApiToken);
  }
  return cachedClient;
}
