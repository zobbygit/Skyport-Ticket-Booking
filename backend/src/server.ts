import http from "http";
import app from "./app";
import { env } from "./config/env";
import { initSocket } from "./services/socket/socket";
import { pool } from "./config/db";

const httpServer = http.createServer(app);
initSocket(httpServer);

async function start() {
  try {
    await pool.query("SELECT 1");
    console.log("[db] Connected.");
  } catch (err) {
    console.error("[db] Connection failed — check DATABASE_URL in .env", err);
  }

  httpServer.listen(env.port, () => {
    console.log(`[server] SkyPort API listening on http://localhost:${env.port}`);
    console.log(`[server] Environment: ${env.nodeEnv}`);
  });
}

start();

process.on("SIGTERM", () => {
  httpServer.close(() => process.exit(0));
});
