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
    <div className="bg-gray-900 text-white flex flex-col items-center  min-h-screen pt-10">
      <div className="md:text-3xl text-[15px] font-bold text-[#902ba9] mb-6 ">Hello {user.firstName} I'm Pascel 😊</div>

      <div
        ref={chatBoxRef}
        className="w-full max-w-2xl h-[450px] overflow-y-auto hide-scrollbar bg-gray-800 p-4 rounded-xl shadow-inner flex flex-col space-y-3"
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

      <div className="flex gap-2 mt-4 w-full max-w-2xl">
        <input
          type="text"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Type a message..."
          className="flex-grow px-4 py-3 rounded-lg bg-gray-700 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#902ba9]"
        />
        <button
          onClick={sendMessage}
          className="px-5 py-3 bg-[#902ba9] text-white rounded-lg hover:bg-[#7a238e] transition-all"
        >
          ➤
        </button>
      </div>
    </div>
  );
};

export default GroqChat;
