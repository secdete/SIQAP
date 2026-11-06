import dotenv from "dotenv";

dotenv.config();

export const config = {
  port: Number(process.env.PORT || 3001),
  host: process.env.HOST || "0.0.0.0",
  corsOrigins: (process.env.CORS_ORIGIN || "http://localhost:3000").split(","),
  redisUrl: process.env.REDIS_URL,
};
