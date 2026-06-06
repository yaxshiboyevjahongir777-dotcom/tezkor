import "dotenv/config";
import http from "http";
import express from "express";
import cors from "cors";

import authRoutes from "./auth/auth.routes";
import ordersRoutes from "./orders/orders.routes";
import driversRoutes from "./drivers/drivers.routes";
import matchingRoutes from "./matching/matching.routes";
import { initSocket } from "./sockets";

const app = express();

app.use(cors());
app.use(express.json());

app.use("/api/auth", authRoutes);
app.use("/api/orders", ordersRoutes);
app.use("/api/drivers", driversRoutes);
app.use("/api/matching", matchingRoutes);

app.get("/", (_req, res) => {
  res.json({ status: "TezGo backend is running 🚀" });
});

const PORT = process.env.PORT || 5000;
const server = http.createServer(app);

initSocket(server);

server.listen(PORT, () => {
  console.log(`✅ Server started on http://localhost:${PORT}`);
});
