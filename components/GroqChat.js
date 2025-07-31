'use client';

import { useState, useEffect, useRef } from "react";
import axios from "axios";

export default function GroqChat({ user }) {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [typing, setTyping] = useState(false);
  const [darkMode, setDarkMode] = useState(true);
  const messagesEndRef = useRef(null);

  // State to hold the AI message being typed out
  const [displayedAIMessage, setDisplayedAIMessage] = useState("");

  // Load memory for this user
  useEffect(() => {
    const loadMemory = async () => {
      try {
        const res = await axios.get(`/api/memory?userId=${user._id}`);
        setMessages(res.data || []);
      } catch (err) {
        console.error("Failed to load memory:", err);
      }
    };
    loadMemory();
  }, [user._id]);

  // Scroll to bottom when messages or displayedAIMessage changes
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, displayedAIMessage]);

  const sendMessage = async () => {
    if (!input.trim()) return;

    const userMsg = { role: "user", content: input };
    setMessages(prev => [...prev, userMsg]);
    setTyping(true);
    setInput("");
    setDisplayedAIMessage(""); // Clear previous typing message

    try {
      const res = await axios.post("/api/chat", {
        userMessage: input,
        userId: user._id,
        userInfo: {
          name: `${user.firstName} ${user.lastName}`,
          email: user.email,
          address: user.address,
          phone: user.mobileNumber
        }
      });

      const fullReply = res.data.reply + " 😊";

      // Typing effect: show AI reply one character at a time
      let i = 0;
      setDisplayedAIMessage("");
      const intervalId = setInterval(() => {
        i++;
        setDisplayedAIMessage(fullReply.slice(0, i));
        if (i === fullReply.length) {
          clearInterval(intervalId);
          setTyping(false);
          setMessages(prev => [...prev, { role: "assistant", content: fullReply }]);
          setDisplayedAIMessage("");
        }
      }, 30); // Adjust typing speed here (ms per char)

    } catch (err) {
      console.error("Chat error:", err);
      setTyping(false);
    }
  };

  const clearMemory = async () => {
    try {
      await axios.delete(`/api/memory?userId=${user._id}`);
      setMessages([]);
      setDisplayedAIMessage("");
    } catch (err) {
      console.error("Failed to clear memory:", err);
    }
  };

  // Handle Enter to send, Shift+Enter for newline
  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <div className={`${darkMode ? "dark" : ""} hide-scrollbar`}>
      <div className="min-h-screen bg-gray-100 dark:bg-gray-900 flex flex-col items-center justify-center px-4 py-6 transition-colors">

        {/* Header */}
        <div className="hidden md:flex justify-between w-full max-w-2xl mb-4">
          <h1 className="text-2xl font-semibold text-gray-800 dark:text-gray-100">Pascel AI 🤓</h1>
          <button
            onClick={() => setDarkMode(!darkMode)}
            className="px-3 py-1 rounded-md bg-gray-300 dark:bg-gray-700 text-sm text-gray-800 dark:text-white"
            aria-label="Toggle dark mode"
          >
            {darkMode ? "Light ☀️" : "Dark 🌙"}
          </button>
        </div>

        {/* Chat messages area */}
        <div className="w-full max-w-2xl bg-white dark:bg-gray-800 rounded-xl shadow-md p-6 space-y-4 h-[70vh] overflow-y-auto">
          {messages.length === 0 && !displayedAIMessage ? (
            <div className="text-center text-gray-500 dark:text-gray-400 text-sm mt-10">
              Hello <span className="font-semibold">{user.firstName}!</span> 👋<br />
              Ask me anything to get started.
            </div>
          ) : (
            <>
              {messages.map((msg, idx) => (
                <div key={idx} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
                  <div className={`p-3 rounded-lg max-w-[70%] text-sm ${
                    msg.role === "user"
                      ? "bg-purple-500 text-white"
                      : "bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-100"
                  }`}>
                    {msg.content}
                  </div>
                </div>
              ))}

              {/* Show AI typing effect message */}
              {typing && displayedAIMessage && (
                <div className="flex justify-start">
                  <div className="p-3 rounded-lg max-w-[70%] text-sm bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-100 font-mono">
                    {displayedAIMessage}
                    <span className="animate-pulse">|</span>
                  </div>
                </div>
              )}
            </>
          )}
          <div ref={messagesEndRef}></div>
        </div>

        {/* Input + buttons */}
        <div className="flex gap-2 w-full max-w-2xl mt-4">
          <textarea
    value={input}
    onChange={(e) => setInput(e.target.value)}
    onKeyDown={handleKeyDown}
    placeholder="Say something..."
    rows={1}
    className="flex-grow px-4 py-2 rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-800 dark:text-white resize-none"
    aria-label="Chat input"
  />
  
  <button
    onClick={sendMessage}
    disabled={!input.trim()} // disables button if input is empty or only whitespace
    className={`px-4 py-2 rounded-md text-white font-medium transition 
      ${!input.trim() 
        ? "bg-purple-300 cursor-not-allowed" 
        : "bg-purple-600 hover:bg-purple-700"}`}
    aria-label="Send message"
  >
    Send
  </button>
          {/* <button
    onClick={clearMemory}
    disabled={!input.trim()} // disables button if input is empty or only whitespace
    className={`px-4 py-2 rounded-md text-white font-medium transition 
      ${!input.trim() 
        ? "bg-purple-300 cursor-not-allowed" 
        : "bg-purple-600 hover:bg-purple-700"}`}
    aria-label="Clear chat memory"
  >
    Clear chat memory
  </button> */}
        </div>

        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 select-none">
          Press <kbd>Enter</kbd> to send, <kbd>Shift + Enter</kbd> for newline.
        </p>
      </div>
    </div>
  );
}
