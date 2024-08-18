import { createContext, useEffect, useState } from "react";
import { baseUrl, socketUrl } from "./constant";
import axios from "axios";
import { io, Socket } from "socket.io-client";
interface hehe {
  isLoggedIn: boolean;
  socket: any;
  user: { name: string; email: string; image: string; id: string };
  setUser: React.Dispatch<
    React.SetStateAction<{
      name: string;
      email: string;
      image: string;
      id: string;
    }>
  >;
  setIsLoggedIn: React.Dispatch<React.SetStateAction<boolean>>;
}
export const context = createContext<hehe | null>(null);
const Context = ({ children }: any) => {
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(false);
  const [socket, setSocket] = useState<any | null>(null);
  const [user, setUser] = useState({
    name: "",
    email: "",
    image: "",
    id: "",
  });
  useEffect(() => {
    let sock: Socket;
    if (isLoggedIn) {
      console.log("making socket connection");
      sock = io(`${socketUrl}`, { query: { id: user.id } });
      setSocket(sock);
    }
    return () => {
      if (sock) {
        sock.close();
      }
    };
  }, [isLoggedIn]);
  useEffect(() => {
    const check = async () => {
      try {
        const res = await axios.get(`${baseUrl}/isloggedin`, {
          withCredentials: true,
        });
        console.log(res.data);
        setUser({
          name: res.data.name,
          email: res.data.email,
          image: res.data.image,
          id: res.data.id,
        });
        setIsLoggedIn(true);
      } catch (err) {
        console.log(err);
      }
    };
    check();
  }, []);
  return (
    <context.Provider
      value={{ isLoggedIn, setIsLoggedIn, socket, user, setUser }}
    >
      {children}
    </context.Provider>
  );
};

export default Context;
