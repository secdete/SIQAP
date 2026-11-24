import dotenv from "dotenv";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

// `pnpm dev` starts this package with cwd = apps/realtime, so a bare
// dotenv.config() never finds the single .env kept at the repo root.
dotenv.config({
  path: resolve(dirname(fileURLToPath(import.meta.url)), "../../../.env"),
});

const rawCors = (process.env.CORS_ORIGIN || "http://localhost:3000").trim();

export const config = {
  port: Number(process.env.PORT || 3001),
  host: process.env.HOST || "0.0.0.0",
  corsOrigins: rawCors === "*" ? true : rawCors.split(",").map((origin) => origin.trim()).filter(Boolean),
  redisUrl: process.env.REDIS_URL,
};
