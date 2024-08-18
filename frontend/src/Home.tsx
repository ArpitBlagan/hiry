import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useToast } from "./components/ui/use-toast";
import { Button } from "./components/ui/button";
import { Input } from "./components/ui/input";
import { useEffect, useState } from "react";
import axios from "axios";
import { baseUrl } from "./constant";
import { Triangle } from "react-loader-spinner";
import { useContext } from "react";
import { context } from "./Context";
import FriendsListing from "./components/FriendsListing";
import Chat from "./components/Chat";
const Home = () => {
  const { toast } = useToast();
  const value = useContext(context);
  const [result, setResult] = useState<any[]>([]);
  const [text, setText] = useState("");
  const [isopen, setIsOpen] = useState(false);
  const [resultLoading, setResultLoading] = useState(false);
  const [addLoading, setAddLoading] = useState(false);
  const [online, setOnline] = useState<any[]>([]);
  const [friends, setFriends] = useState();
  const [refetch, setRefetch] = useState(false);
  const [sele, setSele] = useState<any | null>(null);
  const [friendsLoading, setFriendsLoading] = useState(false);
  const [page, setPage] = useState(1);
  useEffect(() => {
    const getResult = async () => {
      if (text.length == 0) {
        return;
      }
      setResultLoading(true);
      try {
        const res = await axios.get(`${baseUrl}/search?searchText=${text}`, {
          withCredentials: true,
        });
        console.log(res.data);
        setResult(res.data);
        setResultLoading(false);
      } catch (err) {
        setResultLoading(false);
      }
    };
    const time = setTimeout(() => {
      getResult();
    }, 2000);
    return () => {
      clearTimeout(time);
    };
  }, [text]);
  useEffect(() => {
    if (value?.socket) {
      console.log("socket");
      value?.socket.on("onlineUsers", (data: any) => {
        console.log("online", data);
        setOnline(data);
      });
    }
  }, [value?.socket]);
  useEffect(() => {
    const getFriends = async () => {
      console.log("again");
      setFriendsLoading(true);
      try {
        const res = await axios.get(`${baseUrl}/getfriends`, {
          withCredentials: true,
        });
        console.log(res.data);
        setFriends(res.data);
        setFriendsLoading(false);
      } catch (err) {
        console.log(err);
        setFriendsLoading(false);
      }
    };
    getFriends();
  }, [refetch]);
  return (
    <div className="min-h-[80dvh] my-5 flex flex-col gap-2  my-10">
      <div className="flex items-center justify-between w-full">
        <h1 className="text-[30px] font-semibold">Chat Area</h1>
        <Dialog open={isopen} onOpenChange={setIsOpen}>
          <DialogTrigger asChild>
            <p className="glow-on-hover cursor-pointer flex items-center justify-center">
              <span>Add Friend</span>
            </p>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle className="text-center">Search Friend</DialogTitle>
              <DialogDescription>
                <div className="flex flex-col gap-3">
                  <div className="my-4">
                    <Input
                      placeholder="search user's name"
                      value={text}
                      onChange={(e) => {
                        setText(e.target.value);
                      }}
                    />
                  </div>
                  <h1>Results</h1>
                  <div className="px-2">
                    {resultLoading ? (
                      <div className="flex items-center justify-center">
                        <Triangle />
                      </div>
                    ) : result.length == 0 ? (
                      <div className="flex h-full items-center justify-center">
                        <h1>No Data</h1>
                      </div>
                    ) : (
                      <div className="h-[40dvh] overflow-y-scroll flex flex-col gap-2">
                        {result.map((ele, index) => {
                          if (ele.id == value?.user.id) {
                            return;
                          }
                          return (
                            <div
                              className="flex items-center justify-around py-2 border rounded-xl"
                              key={index}
                            >
                              <img
                                src={ele.image}
                                height={40}
                                width={40}
                                className="rounded-xl"
                              />
                              <h1>
                                {ele.name}{" "}
                                <span className="text-sm text-gray-700">
                                  {ele.email}
                                </span>
                              </h1>
                              <Button
                                variant={"destructive"}
                                disabled={addLoading}
                                onClick={async (e) => {
                                  e.preventDefault();
                                  setAddLoading(true);
                                  try {
                                    const body = {
                                      user1: value?.user.id,
                                      user2: ele.id,
                                    };
                                    await axios.post(
                                      `${baseUrl}/addfriend`,
                                      body,
                                      {
                                        withCredentials: true,
                                      }
                                    );
                                    setIsOpen(false);
                                    setRefetch(!refetch);
                                    setAddLoading(false);
                                    toast({
                                      title:
                                        "Added user to your friend list successfully:)",
                                    });
                                  } catch (err) {
                                    toast({
                                      variant: "destructive",
                                      title:
                                        "Error while adding user to your friend list",
                                    });
                                    setAddLoading(false);
                                  }
                                }}
                              >
                                Add
                              </Button>
                            </div>
                          );
                        })}
                        <h1>No User Found</h1>
                      </div>
                    )}
                  </div>
                </div>
              </DialogDescription>
            </DialogHeader>
          </DialogContent>
        </Dialog>
      </div>
      <div className="flex-1 flex  gap-4">
        <div className="hidden md:block">
          <p className="text-sm text-gray-700 mb-4">Friends</p>
          {friendsLoading ? (
            <div className="flex items-center justify-center">
              <Triangle />
            </div>
          ) : (
            <FriendsListing
              friends={friends}
              setSele={setSele}
              setPage={setPage}
            />
          )}
        </div>
        <div className="hidden md:block  flex-1">
          {sele && value && (
            <Chat
              sele={sele}
              online={online}
              socket={value?.socket}
              setSele={setSele}
              userId={value?.user.id}
              page={page}
              setPage={setPage}
              setRefetch={setRefetch}
              refetch={refetch}
            />
          )}
        </div>
        {sele ? (
          <div className="block md:hidden">
            <Chat
              sele={sele}
              online={online}
              socket={value?.socket}
              setSele={setSele}
              userId={value?.user.id}
              page={page}
              setPage={setPage}
              setRefetch={setRefetch}
              refetch={refetch}
            />
          </div>
        ) : (
          <div className="block md:hidden w-full">
            <p className="text-sm text-gray-700 mb-4">Friends</p>
            {friendsLoading ? (
              <div className="flex items-center justify-center">
                <Triangle />
              </div>
            ) : (
              <FriendsListing
                friends={friends}
                setSele={setSele}
                setPage={setPage}
              />
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default Home;
