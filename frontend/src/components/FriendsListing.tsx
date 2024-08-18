import { useState } from "react";

const FriendsListing = ({ friends, setSele, setPage }: any) => {
  const [type, setType] = useState("All");
  return (
    <div className="flex flex-col">
      <div className="flex items-center gap-3">
        <p
          className={`text-center cursor-pointer rounded-3xl py-1 px-2 ${
            type == "All" ? "bg-green-700" : ""
          }`}
          onClick={() => {
            setType("All");
          }}
        >
          All
        </p>
        <p
          className={`text-center cursor-pointer rounded-3xl py-1 px-2 ${
            type == "Unread" ? "bg-green-700" : ""
          }`}
          onClick={() => {
            setType("Unread");
          }}
        >
          Unread
        </p>
      </div>
      {friends &&
        friends.map((ele: any) => {
          if (type == "Unread" && ele?.isRead != false) {
            return;
          }
          return (
            <div
              className={`cursor-pointer py-2 border rounded-xl px-4 md:w-[300px] ${
                ele.isRead == false ? "font-bold" : "font-md"
              }`}
              key={ele.friendId}
              onClick={() => {
                setSele({
                  name: ele.friendName,
                  id: ele.friendId,
                  image: ele.friendImage,
                  email: ele.friendEmail,
                });
                setPage(1);
              }}
            >
              <div className="flex items-center justify-around ">
                <img
                  src={ele.friendImage}
                  height={40}
                  width={40}
                  className="rounded-xl"
                />
                <h1>
                  {ele.friendName}{" "}
                  <span className="text-sm text-gray-700">
                    {ele.friendEmail}
                  </span>
                </h1>
              </div>
              <p
                className={`text-center ${
                  ele.isRead == false ? "text-bold" : ""
                }`}
              >
                {ele?.lastText}
              </p>
            </div>
          );
        })}
    </div>
  );
};

export default FriendsListing;
