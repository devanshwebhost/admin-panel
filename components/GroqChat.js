// components/GroqChat.jsx
"use client";
import React, { useEffect, useRef, useState } from "react";

const GroqChat = () => {
  const [chatHistory, setChatHistory] = useState([]);
  const [inputValue, setInputValue] = useState("");
  const chatBoxRef = useRef(null);

  // Load chat history from localStorage on mount
  useEffect(() => {
    const history = JSON.parse(localStorage.getItem("chatHistory")) || [];
    setChatHistory(history);
  }, []);

  // Scroll to bottom on new message
  useEffect(() => {
    if (chatBoxRef.current) {
      chatBoxRef.current.scrollTop = chatBoxRef.current.scrollHeight;
    }
  }, [chatHistory]);

  const saveMessage = (sender, message) => {
    setChatHistory((prevHistory) => {
      const updated = [...prevHistory, { sender, message }];
      localStorage.setItem("chatHistory", JSON.stringify(updated));
      return updated;
    });
  };

  const sendMessage = async () => {
    const message = inputValue.trim();
    if (!message) return;

    setInputValue("");
    saveMessage("user", message);
    saveMessage("bot", "...typing");

    try {
      const response = await fetch("https://pascel.onrender.com/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userMessage: message }),
      });

      const data = await response.json();

      // Replace last "typing" with actual response
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
    <div className="h-[85vh] bg-gray-900 text-white flex flex-col items-center p-4">
      <div className="text-2xl font-semibold text-[#902ba9] mb-4">
        I am Pascel 😊
      </div>

      <div
        ref={chatBoxRef}
        className="w-full max-w-xl h-[400px] overflow-y-auto bg-gray-800 p-4 rounded shadow-inner space-y-2"
      >
        {chatHistory.map((msg, index) => (
          <div
            key={index}
            className={`p-2 rounded-md max-w-[80%] ${
              msg.sender === "user"
                ? "bg-[#902ba9] text-white self-end ml-auto"
                : "bg-gray-700 text-[#902ba9] self-start"
            }`}
          >
            {msg.message}
          </div>
        ))}
      </div>

      <div className="flex gap-2 mt-4 w-full max-w-xl">
        <input
          type="text"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Type a message..."
          className="flex-grow px-4 py-2 rounded bg-gray-700 text-white placeholder-gray-400 focus:outline-none"
        />
        <button
          onClick={sendMessage}
          className="px-4 py-2 bg-[#902ba9] text-white rounded hover:bg-[#7a238e] transition"
        >
          ➤
        </button>
      </div>
    </div>
  );
};

export default GroqChat;
