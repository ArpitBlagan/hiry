import { useEffect, useRef } from "react";
import { Triangle } from "react-loader-spinner";

const MessagesListing = ({ messages, setPage, userId, ll, page }: any) => {
  const divRef = useRef(null);
  const anotherRef = useRef(null);
  useEffect(() => {
    if (divRef && divRef.current && page == 1) {
      //@ts-ignore
      divRef.current?.scrollIntoView({
        block: "end",
        inline: "nearest",
      });
    }
  }, [messages]);
  const ff = () => {
    setPage((prev: any) => {
      return prev + 1;
    });
  };
  const handleScroll = () => {
    console.log("working");
    //@ts-ignore
    if (anotherRef && anotherRef.current.scrollTop == 0) {
      // The user has scrolled to the top
      console.log("fetch data");
      ff();
    }
  };

  return (
    <div
      className="flex flex-col gap-2 my-2 overflow-y-scroll h-[60dvh]"
      ref={anotherRef}
      onScroll={handleScroll}
    >
      {ll && (
        <div className="flex items-center justify-center">
          <Triangle height={20} width={20} />
        </div>
      )}
      {messages.map((ele: any, index: any) => {
        return (
          <div
            key={index}
            className={`flex items-center  ${
              ele.from == userId ? "justify-end" : "justify-start"
            }`}
          >
            {ele.type == "image" && (
              <img
                src={ele.text}
                alt="Preview"
                style={{ width: "200px", height: "300p" }}
              />
            )}
            {ele.type == "video" && (
              <video
                src={ele.text}
                controls
                style={{ width: "200px", height: "300px" }}
              />
            )}
            {ele.type == "text" && (
              <p
                className={`py-2 px-4 rounded-xl ${
                  ele.from == userId ? "bg-orange-700" : "border"
                }`}
              >
                {ele.text}
              </p>
            )}
          </div>
        );
      })}
      <div ref={divRef}></div>
    </div>
  );
};

export default MessagesListing;
