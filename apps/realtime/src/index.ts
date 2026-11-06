import express from "express";
import { createServer } from "http";
import { Server } from "socket.io";
import cors from "cors";
import { ClientToServerEvents, ServerToClientEvents } from "@siqap/shared";
import { config } from "./config.js";
import { getSessionStore } from "./store/index.js";
import { GameManager } from "./engine/game-manager.js";
import { registerSocketHandlers } from "./socket/handlers.js";

const app: express.Express = express();
app.use(cors({ origin: config.corsOrigins, credentials: true }));
app.use(express.json());

app.get("/health", (_req, res) => {
  res.json({
    status: "ok",
    service: "siqap-realtime",
    uptime: process.uptime(),
    timestamp: Date.now(),
  });
});

const httpServer = createServer(app);

const io = new Server<ClientToServerEvents, ServerToClientEvents>(httpServer, {
  cors: {
    origin: config.corsOrigins,
    methods: ["GET", "POST"],
    credentials: true,
  },
  pingInterval: 10000,
  pingTimeout: 5000,
});

const store = getSessionStore();
const gameManager = new GameManager(store, io);

io.on("connection", (socket) => {
  registerSocketHandlers(io, socket, gameManager);

  socket.on("disconnect", () => {
    // Player disconnect tracking handled by GameManager
  });
});

httpServer.listen(config.port, config.host, () => {
  console.log(`[SIQAP Realtime] Server running on http://${config.host}:${config.port}`);
});

process.on("SIGTERM", () => {
  console.log("[SIQAP Realtime] Received SIGTERM, closing gracefully...");
  httpServer.close(() => {
    process.exit(0);
  });
});

process.on("SIGINT", () => {
  console.log("[SIQAP Realtime] Received SIGINT, closing gracefully...");
  httpServer.close(() => {
    process.exit(0);
  });
});

export { app, io, httpServer };
