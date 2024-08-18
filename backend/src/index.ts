import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import { router } from "./route";
import { createServer } from "http";
import { Server, Socket } from "socket.io";
import { SocketManager } from "./manager";
import dotenv from "dotenv";
dotenv.config();
const app = express();
const instance = SocketManager.getInstance();
app.use(
  cors({
    origin: ["http://localhost:5173"],
    credentials: true,
  })
);
app.use(cookieParser());
app.use(express.json());
app.use("/api", router);
const server = createServer(app);
const io = new Server(server, { cors: { origin: ["http://localhost:5173"] } });
io.on("connection", (ws: Socket) => {
  const query = ws.handshake.query;
  console.log("query", query);
  if (query.id) {
    instance.addUser(ws, query.id as string);
  }
  ws.on("message", (data) => {
    instance.handleMessage(data, ws);
  });
  ws.on("typing", (data) => {
    instance.handleTyping(data.from, data.to);
  });
  ws.on("getOnlineUsers", () => {
    instance.sendOnlineUsers(ws);
  });
  ws.on("close", () => {
    instance.removeUser(ws);
  });
});
server.listen(process.env.PORT || 9000, () => {
  console.log(`listening on port ${process.env.PORT}`);
});
