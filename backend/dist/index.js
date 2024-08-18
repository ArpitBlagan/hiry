"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const cookie_parser_1 = __importDefault(require("cookie-parser"));
const route_1 = require("./route");
const http_1 = require("http");
const socket_io_1 = require("socket.io");
const manager_1 = require("./manager");
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const app = (0, express_1.default)();
const instance = manager_1.SocketManager.getInstance();
app.use((0, cors_1.default)({
    origin: ["http://localhost:5173"],
    credentials: true,
}));
app.use((0, cookie_parser_1.default)());
app.use(express_1.default.json());
app.use("/api", route_1.router);
const server = (0, http_1.createServer)(app);
const io = new socket_io_1.Server(server, { cors: { origin: ["http://localhost:5173"] } });
io.on("connection", (ws) => {
    const query = ws.handshake.query;
    console.log("query", query);
    if (query.id) {
        instance.addUser(ws, query.id);
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
