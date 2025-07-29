"use client";
import React, { useEffect, useRef, useState } from "react";
import { Loader2 } from "lucide-react";

const GroqChat = ({user}) => {
  const [chatHistory, setChatHistory] = useState([]);
  const [inputValue, setInputValue] = useState("");
  const chatBoxRef = useRef(null);

  useEffect(() => {
    const history = JSON.parse(localStorage.getItem("chatHistory")) || [];
    setChatHistory(history);
  }, []);

  useEffect(() => {
    if (chatBoxRef.current) {
      chatBoxRef.current.scrollTop = chatBoxRef.current.scrollHeight;
    }
  }, [chatHistory]);

  const saveMessage = (sender, message) => {
    setChatHistory((prev) => {
      const updated = [...prev, { sender, message }];
      localStorage.setItem("chatHistory", JSON.stringify(updated));
      return updated;
    });
  };

  const sendMessage = async () => {
    const message = inputValue.trim();
    if (!message) return;

    setInputValue("");
    saveMessage("user", message);
    saveMessage("bot", "__typing__");

    try {
      const response = await fetch("https://pascel.onrender.com/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userMessage: message }),
      });

      const data = await response.json();

      setChatHistory((prev) => {
        const updated = [
          ...prev.slice(0, -1),
          { sender: "bot", message: data.reply },
        ];
        localStorage.setItem("chatHistory", JSON.stringify(updated));
        return updated;
      });
    } catch (error) {
      console.error("Fetch error:", error);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };


  return (
    <div className=" bg-gray-800 text-white flex flex-col items-center  min-h-screen pt-5 bg-ai">
      {/* <img src="../ai-bg.gif" className="w-full mt-[-20px] max-h-screen fixed z-[-10]"/> */}
      {/* <div className="flex items-center justify-center gap-2 mb-5" > <img src="../logo.png" width={50} className="rounded-4xl"/> <h1 className="md:text-3xl text-[15px] font-bold text-[#902ba9]">- Pascel</h1></div> */}

      <div
        ref={chatBoxRef}
        className="w-full max-w-2xl md:h-[85vh] h-[80vh] md:mt-0 mt-[-20px] overflow-y-auto hide-scrollbar bg-gray-800 p-4 md:rounded-xl shadow-inner flex flex-col space-y-3"
       >
        {chatHistory.map((msg, index) => (
          <div
            key={index}
            className={`flex ${
              msg.sender === "user" ? "justify-end" : "justify-start"
            }`}
          >
            <div
              className={`px-4 py-2 rounded-lg max-w-[80%] text-sm ${
                msg.sender === "user"
                  ? "bg-[#902ba9] text-white rounded-br-none"
                  : msg.message === "__typing__"
                  ? "bg-gray-700 text-white italic animate-pulse"
                  : "bg-gray-700 text-[#ffff] rounded-bl-none"
              }`}
            >
              {msg.message === "__typing__" ? "Pascel is typing..." : msg.message}
            </div>
          </div>
        ))}
      </div>

      <div className="flex md:gap-2  md:mt-4 w-full max-w-2xl mt-0">
        <input
          type="text"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Type a message..."
          className="flex-grow m-2 px-4  py-3 md:rounded-lg bg-gray-700 text-white placeholder-gray-400 focus:outline-none focus:ring-2 "
        />
        <button
          onClick={sendMessage}
          className="px-5 py-3 m-2 bg-[#902ba9] text-white md:rounded-lg hover:bg-[#7a238e] transition-all"
        >
          ➤
        </button>
      </div>
    </div>
  );
};

export default GroqChat;
