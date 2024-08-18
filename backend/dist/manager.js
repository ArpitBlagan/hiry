"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.SocketManager = void 0;
const message_1 = require("./controller/message");
class SocketManager {
    constructor() {
        this.User = new Map();
        this.arr = [];
    }
    static getInstance() {
        if (!this.instance) {
            this.instance = new SocketManager();
        }
        return this.instance;
    }
    sendOnlineUsers(ws) {
        const onlineUsers = this.arr.map((user) => ({ id: user.id }));
        ws.emit("onlineUsers", onlineUsers);
    }
    handleTyping(from, to) {
        const user = this.User.get(to);
        user === null || user === void 0 ? void 0 : user.emit("typing", { message: "typing", from });
    }
    removeUserOnline(id) {
        const user = this.User.get(id);
        if (user) {
            this.User.delete(id);
            const ff = this.arr.filter((ele) => ele.ws != user);
            this.arr = ff;
        }
    }
    addUser(ws, id) {
        console.log(id);
        this.removeUserOnline(id);
        this.User.set(id, ws);
        this.arr.push({ id, ws });
        console.log("user added now sending online users list to user");
        this.broadcastOnlineUsers();
    }
    handleMessage(message, ws) {
        return __awaiter(this, void 0, void 0, function* () {
            const user = this.User.get(message.to);
            yield (0, message_1.saveMessage)(message.text, message.type, message.from, message.to);
            if (user) {
                user.emit("message", {
                    text: message.text,
                    from: message.from,
                    type: message.type,
                });
            }
        });
    }
    removeUser(ws) {
        const user = this.arr.find((ele) => ele.ws == ws);
        if (user) {
            this.User.delete(user.id);
            const ff = this.arr.filter((ele) => ele.ws != ws);
            this.arr = ff;
        }
    }
    broadcastOnlineUsers() {
        const onlineUsers = this.arr.map((user) => ({ id: user.id }));
        this.User.forEach((socket) => {
            socket.emit("onlineUsers", onlineUsers);
        });
    }
}
exports.SocketManager = SocketManager;
