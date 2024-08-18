import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { ArrowLeft, PaperclipIcon } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useEffect, useState } from "react";
import { baseUrl } from "@/constant";
import axios from "axios";
import { useToast } from "./ui/use-toast";
import { Triangle } from "react-loader-spinner";
import MessagesListing from "./MessagesListing";

const Chat = ({
  sele,
  online,
  socket,
  setSele,
  userId,
  page,
  setPage,
  setRefetch,
  refetch,
}: any) => {
  const { toast } = useToast();
  const [on, setOn] = useState(false);
  const [isopen, setIsOpen] = useState(false);
  const [file, setFile] = useState<null | any>(null);
  const [preview, setPreview] = useState<null | any>(null);
  const [text, setText] = useState("");
  const [messageLoading, setMessageLoading] = useState(false);
  const [messages, setMessages] = useState<any[]>([]);
  const [typing, setTyping] = useState<any>({ from: "" });
  const [getOtherLoading, setGetOtherLoading] = useState(false);
  const [type, setType] = useState(false);
  const handleUpload = async () => {
    try {
      if (!socket) {
        return;
      }
      const formData = new FormData();
      formData.append("file", file);
      const url = await axios.post(`${baseUrl}/upload`, formData);
      console.log("imageUrl", url.data);
      const fileType = file.type;
      let type;
      if (fileType.startsWith("image/")) {
        type = "image";
      } else {
        type = "video";
      }
      socket.emit("message", {
        type,
        text: url.data,
        from: userId,
        to: sele.id,
      });
      setIsOpen(false);
      setMessages((prev) => {
        return [...prev, { type, text: url.data, from: sele.userId }];
      });
    } catch (err) {
      console.log(err);
      toast({
        variant: "destructive",
        title: "File size is too large please upload a small size file:(",
      });
    }
  };
  const handleSend = () => {
    if (!socket) {
      return;
    }
    socket.emit("message", {
      type: "text",
      text,
      from: userId,
      to: sele.id,
    });
    setMessages((prev) => {
      return [...prev, { type: "text", text, from: userId }];
    });
    setText("");
  };
  useEffect(() => {
    if (socket) {
      socket.on("typing", (data: any) => {
        console.log("typing..", data);
        if (data.from != typing.from) {
          setTyping({
            from: data.from,
          });
        }
      });
    }
  }, [socket]);
  useEffect(() => {
    setType(true);
    let time = setTimeout(() => {
      setType(false);
    }, 2000);
    return () => {
      clearTimeout(time);
    };
  }, [typing]);
  useEffect(() => {
    console.log("checking online");
    let ff = online.find((ele: any) => {
      return ele.id == sele.id;
    });
    if (sele && online && ff) {
      setOn(true);
    } else {
      setOn(false);
    }
  }, [online]);
  useEffect(() => {
    if (socket) {
      socket.on("message", (data: any) => {
        setRefetch(!refetch);
        console.log("socket", data);
        if (data.from == sele.id) {
          setMessages((prev) => {
            return [
              ...prev,
              { type: data.type, text: data.text, from: data.from },
            ];
          });
        }
      });
    }
  }, [socket, sele]);
  useEffect(() => {
    const getMessages = async () => {
      if (page == 1) {
        setMessageLoading(true);
      } else {
        setGetOtherLoading(true);
      }
      try {
        const res = await axios.get(
          `${baseUrl}/getmessages?from=${userId}&to=${sele.id}&page=${page}`,
          { withCredentials: true }
        );
        console.log(res.data);
        if (page == 1) {
          setMessages(res.data);
        } else {
          setMessages((prev) => [res.data, ...prev]);
        }
        setGetOtherLoading(false);
        setMessageLoading(false);
      } catch (err) {
        console.log(err);
        setMessageLoading(false);
        setGetOtherLoading(false);
      }
    };
    if (sele && userId) {
      getMessages();
    }
  }, [sele, page]);
  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center gap-2 py-4 border px-2 rounded-xl">
        <div className="md:hidden">
          <ArrowLeft
            className="cursor-pointer"
            onClick={() => {
              setSele(null);
            }}
          />
        </div>
        {type && typing.from == sele.id && (
          <p className="text-green-700">Typing...</p>
        )}
        <div className="flex-1 flex items-center justify-end gap-5 px-4">
          <img
            src={sele?.image}
            height={40}
            width={40}
            className="rounded-xl"
          />
          <div className="flex flex-col gap-2">
            <p>{sele?.name}</p>

            <p>
              {on ? (
                <span className="text-green-700">online</span>
              ) : (
                <span className="text-red-600">offline</span>
              )}
            </p>
          </div>
        </div>
      </div>
      <div className="flex-1  ">
        {messageLoading ? (
          <div className="flex items-center justify-center">
            <Triangle />
          </div>
        ) : (
          <div>
            <MessagesListing
              setPage={setPage}
              userId={userId}
              messages={messages}
              ll={getOtherLoading}
              page={page}
            />
          </div>
        )}
      </div>
      <div className="flex items-center gap-2">
        <Input
          className="flex-1"
          placeholder="Hey there"
          value={text}
          onChange={(e) => {
            setText(e.target.value);
          }}
        />
        <Dialog open={isopen} onOpenChange={setIsOpen}>
          <DialogTrigger>
            {" "}
            <PaperclipIcon className="cursor-pointer" />
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle className="text-center ">
                Upload Image/Video
              </DialogTitle>
              <DialogDescription>
                <div className="my-4 flex flex-col gap-5 items-center justify-center">
                  <Input
                    type="file"
                    className=""
                    placeholder="choose Image or Video"
                    onChange={(e: any) => {
                      const ff = e.target?.files[0];
                      setFile(ff);
                      const reader = new FileReader();
                      reader.onloadend = () => {
                        setPreview(reader.result);
                      };
                      reader.readAsDataURL(ff);
                    }}
                  />
                  {preview && (
                    <div className="flex items-center justify-center w-full">
                      <img
                        src={preview}
                        alt="Preview"
                        style={{ width: "200px", marginTop: "10px" }}
                        className="rounded-md"
                      />
                    </div>
                  )}
                  <Button
                    className="w-1/2"
                    onClick={(e) => {
                      e.preventDefault();
                      handleUpload();
                    }}
                  >
                    Upload
                  </Button>
                </div>
              </DialogDescription>
            </DialogHeader>
          </DialogContent>
        </Dialog>
        <Button
          onClick={(e) => {
            e.preventDefault();
            socket.emit("typing", { from: userId, to: sele.id });
            handleSend();
          }}
        >
          Send
        </Button>
      </div>
    </div>
  );
};

export default Chat;
