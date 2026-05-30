'use client';

import { useState, useEffect, useRef } from "react";
import axios from "axios";
import ReactMarkdown from "react-markdown";

export default function GroqChat({ user, userContext, refreshContext }) {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [typing, setTyping] = useState(false);
  const [isClearing, setIsClearing] = useState(false);
  const [darkMode, setDarkMode] = useState(true);
  const messagesEndRef = useRef(null);
  const typingIntervalRef = useRef(null);

  const [displayedAIMessage, setDisplayedAIMessage] = useState("");

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

    return () => {
      if (typingIntervalRef.current) clearInterval(typingIntervalRef.current);
    };
  }, [user._id]);

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, 100);
    return () => clearTimeout(timeoutId);
  }, [messages, displayedAIMessage, typing]);

  const sendMessage = async () => {
    if (!input.trim() || typing) return;

    const userMsg = { role: "user", content: input };
    setMessages(prev => [...prev, userMsg]);
    setTyping(true);
    setInput("");
    setDisplayedAIMessage(""); 

    if (typingIntervalRef.current) clearInterval(typingIntervalRef.current);

    try {
      const latestContext = refreshContext ? await refreshContext() : userContext;
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 20000);

      const res = await axios.post("/api/chat", {
        userMessage: input,
        userId: user._id,
        userContext: latestContext, 
        userInfo: {
          name: `${user.firstName} ${user.lastName}`,
          email: user.email,
          address: user.address,
          phone: user.phone
        }
      }, { signal: controller.signal });

      clearTimeout(timeout);

      let fullReply = res.data.reply;

      const isValidObjectId = (id) => /^[0-9a-fA-F]{24}$/.test(id);
      const actionRegex = /\[\[ACTION:(.*?):(.*?)\]\]/g;
      let match;
      while ((match = actionRegex.exec(fullReply)) !== null) {
        const [fullMatch, actionType, payload] = match;
        fullReply = fullReply.replace(fullMatch, ""); 
        const payloadValue = payload.trim();

        if (!payloadValue) continue;

        if (actionType !== "ADD_TODO" && !isValidObjectId(payloadValue)) continue;

        if (actionType === "DELETE_TODO") {
          await axios.delete('/api/userTodos', { data: { userId: user._id, todoId: payloadValue } });
        } else if (actionType === "ADD_TODO") {
          await axios.post('/api/userTodos', { userId: user._id, text: payloadValue });
        } else if (actionType === "TOGGLE_TODO") {
          await axios.patch('/api/userTodos', { userId: user._id, todoId: payloadValue, toggle: true });
        }
      }

      fullReply = fullReply.trim();

      let i = 0;
      setDisplayedAIMessage("");
      typingIntervalRef.current = setInterval(() => {
        i++;
        setDisplayedAIMessage(fullReply.slice(0, i));
        if (i === fullReply.length) {
          clearInterval(typingIntervalRef.current);
          setTyping(false);
          setMessages(prev => [...prev, { role: "assistant", content: fullReply }]);
          setDisplayedAIMessage("");
        }
      }, 15); // 💡 Typing speed thodi fast kar di hai

    } catch (err) {
      clearInterval(typingIntervalRef.current);
      let errorMessage = "⚠️ Connection issue. I'm still here! Try again in a moment.";
      if (err.message === "Aborted" || err.code === "ECONNABORTED") {
        errorMessage = "⏳ Request timed out. The API might be busy. Please try again. 🔄";
      } else if (err.response?.status >= 500) {
        errorMessage = "🔧 Server having issues. No worries! Your message is saved. 💪";
      }
      setTyping(false);
      setMessages(prev => [...prev, { role: "assistant", content: errorMessage }]);
    }
  };

  const clearMemory = async () => {
    try {
      setIsClearing(true);
      await axios.delete(`/api/memory?userId=${user._id}`);
      setMessages([]);
      setDisplayedAIMessage("");
    } catch (err) {
      console.error("Failed to clear memory:", err);
    } finally {
      setIsClearing(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <div className={`flex flex-col flex-grow ${darkMode ? "dark bg-[#131314]" : "bg-white"} transition-colors overflow-hidden`}>
      
      {/* 💡 Sleek Header */}
      <div className="flex justify-between items-center px-6 py-4 max-w-4xl mx-auto w-full">
        <h1 className="text-xl font-medium text-gray-800 dark:text-gray-200 tracking-tight">Pascel</h1>
        <div className="flex gap-3">
          <button onClick={() => setDarkMode(!darkMode)} className="text-gray-500 hover:text-gray-800 dark:hover:text-gray-200 transition">
            {darkMode ? (
               <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6"><path strokeLinecap="round" strokeLinejoin="round" d="M12 3v2.25m6.364.386-1.591 1.591M21 12h-2.25m-.386 6.364-1.591-1.591M12 18.75V21m-4.773-4.227-1.591 1.591M5.25 12H3m4.227-4.773L5.636 5.636M15.75 12a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0Z" /></svg>
            ) : (
               <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6"><path strokeLinecap="round" strokeLinejoin="round" d="M21.752 15.002A9.72 9.72 0 0 1 18 15.75c-5.385 0-9.75-4.365-9.75-9.75 0-1.33.266-2.597.748-3.752A9.753 9.753 0 0 0 3 11.25C3 16.635 7.365 21 12.75 21a9.753 9.753 0 0 0 9.002-5.998Z" /></svg>
            )}
          </button>
          <button onClick={clearMemory} disabled={isClearing} title="Clear Chat" className="text-gray-500 hover:text-red-500 transition">
             <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6"><path strokeLinecap="round" strokeLinejoin="round" d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0" /></svg>
          </button>
        </div>
      </div>

      {/* 💡 Main Chat Area (Gemini Style) */}
      <div className="flex-grow overflow-y-auto px-4 md:px-10 scroll-smooth">
        <div className="max-w-3xl mx-auto flex flex-col space-y-8 pb-10 pt-4">
          
          {messages.length === 0 && !displayedAIMessage ? (
            <div className="flex flex-col items-center justify-center mt-20 text-center">
               <div className="h-16 w-16 bg-gradient-to-tr from-purple-500 to-blue-500 rounded-full mb-6 opacity-80 blur-[2px]"></div>
               <h2 className="text-3xl font-semibold text-gray-800 dark:text-gray-200 mb-2">Hello, {user.firstName}</h2>
               <p className="text-gray-500 dark:text-gray-400">How can Pascel help you today?</p>
            </div>
          ) : (
            <>
              {messages.map((msg, idx) => (
                <div key={idx} className={`flex w-full ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
                  {msg.role === "user" ? (
                    // User Message - Rounded Bubble
                    <div className="px-5 py-3.5 bg-[#f0f4f9] dark:bg-[#1e1e20] text-gray-800 dark:text-gray-100 rounded-3xl rounded-tr-md max-w-[85%] text-[15px] leading-relaxed">
                      {msg.content}
                    </div>
                  ) : (
                    // AI Message - Clean Text with Sparkle Icon
                    <div className="flex gap-4 max-w-[90%] w-full">
                      <div className="flex-shrink-0 mt-1 text-purple-600 dark:text-purple-400">
                         <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6"><path fillRule="evenodd" d="M9.315 7.584C12.195 3.883 16.695 1.5 21.75 1.5a.75.75 0 0 1 .75.75c0 5.056-2.383 9.555-6.084 12.436A11.894 11.894 0 0 1 12 15a11.894 11.894 0 0 1-4.416-.314 12.04 12.04 0 0 1-6.084-12.436A.75.75 0 0 1 2.25 1.5c5.056 0 9.555 2.383 12.436 6.084Z" clipRule="evenodd" /><path d="M3.251 18.204A8.956 8.956 0 0 0 12 20.25a8.956 8.956 0 0 0 8.749-2.046.75.75 0 0 1 1.06 1.06A10.456 10.456 0 0 1 12 21.75a10.456 10.456 0 0 1-9.809-2.486.75.75 0 1 1 1.06-1.06Z" /></svg>
                      </div>
                      <div className="prose dark:prose-invert max-w-none text-[15px] leading-relaxed text-gray-800 dark:text-gray-100 mt-1">
                        <ReactMarkdown>{msg.content}</ReactMarkdown>
                      </div>
                    </div>
                  )}
                </div>
              ))}

              {/* Typing Effect Message */}
              {typing && !displayedAIMessage && (
                <div className="flex w-full justify-start">
                  <div className="flex gap-4 max-w-[90%] w-full">
                    <div className="flex-shrink-0 mt-1 text-purple-600 dark:text-purple-400">
                      <div className="h-8 w-8 rounded-full bg-purple-500/20 flex items-center justify-center">
                        <span className="h-2.5 w-2.5 rounded-full bg-purple-500 animate-pulse"></span>
                      </div>
                    </div>
                    <div className="rounded-3xl bg-gray-200 dark:bg-[#242528] border border-gray-300 dark:border-gray-700 p-4 max-w-[95%] text-sm text-gray-700 dark:text-gray-200">
                      <div className="font-medium">Pascel is thinking...</div>
                      <div className="mt-2 flex gap-2">
                        <span className="h-2.5 w-2.5 rounded-full bg-purple-500 animate-pulse"></span>
                        <span className="h-2.5 w-2.5 rounded-full bg-purple-500 animate-pulse delay-150"></span>
                        <span className="h-2.5 w-2.5 rounded-full bg-purple-500 animate-pulse delay-300"></span>
                      </div>
                    </div>
                  </div>
                </div>
              )}
              {typing && displayedAIMessage && (
                <div className="flex w-full justify-start">
                   <div className="flex gap-4 max-w-[90%] w-full">
                      <div className="flex-shrink-0 mt-1 text-purple-600 dark:text-purple-400">
                         <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6 animate-pulse"><path fillRule="evenodd" d="M9.315 7.584C12.195 3.883 16.695 1.5 21.75 1.5a.75.75 0 0 1 .75.75c0 5.056-2.383 9.555-6.084 12.436A11.894 11.894 0 0 1 12 15a11.894 11.894 0 0 1-4.416-.314 12.04 12.04 0 0 1-6.084-12.436A.75.75 0 0 1 2.25 1.5c5.056 0 9.555 2.383 12.436 6.084Z" clipRule="evenodd" /></svg>
                      </div>
                      <div className="prose dark:prose-invert max-w-none text-[15px] leading-relaxed text-gray-800 dark:text-gray-100 mt-1">
                        <ReactMarkdown>{displayedAIMessage}</ReactMarkdown>
                        <span className="inline-block w-1.5 h-4 ml-1 bg-purple-500 animate-pulse align-middle"></span>
                      </div>
                    </div>
                </div>
              )}
            </>
          )}
          <div ref={messagesEndRef}></div>
        </div>
      </div>

      {/* 💡 Sleek Input Area (Bottom Fixed style) */}
      <div className="p-4 md:px-10 pb-6 w-full">
        <div className="max-w-3xl mx-auto relative">
          {typing && !displayedAIMessage && (
            <div className="mb-3 text-center text-xs text-gray-500 dark:text-gray-400">
              Pascel is thinking... this may take a moment.
            </div>
          )}
          <div className={`flex items-center rounded-[30px] pr-2 pl-6 py-2 transition-all ${
              darkMode ? "bg-[#1e1e20] focus-within:bg-[#28282b]" : "bg-[#f0f4f9] focus-within:bg-[#e6eaf1]"
            }`}>
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Ask Pascel anything..."
              rows={1}
              className="flex-grow bg-transparent border-none focus:ring-0 text-gray-800 dark:text-white resize-none max-h-32 text-[15px] py-3 outline-none"
            />
            <button
              onClick={sendMessage}
              disabled={!input.trim() || typing}
              className={`flex-shrink-0 p-3 ml-2 rounded-full transition-all duration-200 flex items-center justify-center
                ${(!input.trim() || typing)
                  ? "bg-transparent text-gray-400 dark:text-gray-500" 
                  : "bg-purple-600 text-white shadow-md hover:bg-purple-700 hover:scale-105"}`}
            >
              {typing ? (
                <span className="flex items-center gap-2 text-sm">
                  <span className="h-2.5 w-2.5 rounded-full bg-white animate-pulse"></span>
                  Thinking
                </span>
              ) : (
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
                  <path d="M3.478 2.404a.75.75 0 0 0-.926.941l2.432 7.905H13.5a.75.75 0 0 1 0 1.5H4.984l-2.432 7.905a.75.75 0 0 0 .926.94 60.519 60.519 0 0 0 18.445-8.986.75.75 0 0 0 0-1.218A60.517 60.517 0 0 0 3.478 2.404Z" />
                </svg>
              )}
            </button>
          </div>
          <p className="text-[11px] text-center text-gray-500 dark:text-gray-400 mt-3 select-none">
             Pascel is an AI and may display inaccurate info, so double-check important details.
          </p>
        </div>
      </div>

    </div>
  );
}