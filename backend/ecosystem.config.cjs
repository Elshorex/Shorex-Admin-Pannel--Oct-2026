const fs = require("fs");
const path = require("path");

function loadEnvFile(filename) {
  const filePath = path.join(__dirname, filename);
  if (!fs.existsSync(filePath)) return {};
  const env = {};
  for (const line of fs.readFileSync(filePath, "utf8").split("\n")) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const idx = trimmed.indexOf("=");
    if (idx === -1) continue;
    const key = trimmed.slice(0, idx).trim();
    const value = trimmed.slice(idx + 1).trim();
    env[key] = value;
  }
  return env;
}

const postmarkEnv = {
  ...loadEnvFile(".env"),
  ...loadEnvFile(".env.postmark"),
};

module.exports = {
  apps: [
    {
      name: "shorex-backend",
      script: "src/app.js",
      cwd: __dirname,
      instances: 1,
      exec_mode: "fork",
      autorestart: true,
      max_restarts: 20,
      min_uptime: "10s",
      exp_backoff_restart_delay: 200,
      env: {
        NODE_ENV: "production",
        ...postmarkEnv,
      },
    },
  ],
};
