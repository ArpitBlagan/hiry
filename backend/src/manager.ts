import { Socket } from "socket.io";
import { saveMessage } from "./controller/message";

interface user {
  ws: Socket;
  id: string;
}
export class SocketManager {
  private static instance: SocketManager;
  private User: Map<string, Socket>;
  private arr: user[];

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
  sendOnlineUsers(ws: Socket) {
    const onlineUsers = this.arr.map((user) => ({ id: user.id }));
    ws.emit("onlineUsers", onlineUsers);
  }
  handleTyping(from: string, to: string) {
    const user = this.User.get(to);
    user?.emit("typing", { message: "typing", from });
  }
  removeUserOnline(id: string) {
    const user = this.User.get(id);
    if (user) {
      this.User.delete(id);
      const ff = this.arr.filter((ele) => ele.ws != user);
      this.arr = ff;
    }
  }
  addUser(ws: Socket, id: string) {
    console.log(id);
    this.removeUserOnline(id);
    this.User.set(id, ws);
    this.arr.push({ id, ws });
    console.log("user added now sending online users list to user");
    this.broadcastOnlineUsers();
  }
  async handleMessage(message: any, ws: Socket) {
    const user = this.User.get(message.to);
    await saveMessage(message.text, message.type, message.from, message.to);
    if (user) {
      user.emit("message", {
        text: message.text,
        from: message.from,
        type: message.type,
      });
    }
  }
  removeUser(ws: Socket) {
    const user = this.arr.find((ele) => ele.ws == ws);
    if (user) {
      this.User.delete(user.id);
      const ff = this.arr.filter((ele) => ele.ws != ws);
      this.arr = ff;
    }
  }
  private broadcastOnlineUsers(): void {
    const onlineUsers = this.arr.map((user) => ({ id: user.id }));
    this.User.forEach((socket) => {
      socket.emit("onlineUsers", onlineUsers);
    });
  }
}
