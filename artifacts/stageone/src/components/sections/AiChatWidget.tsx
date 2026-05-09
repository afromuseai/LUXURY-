import React, { useState, useRef, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Send, Bot, Loader2, ChevronDown } from "lucide-react";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  isStreaming?: boolean;
}

const faviconSrc = "/favicon.png";

const WELCOME_MESSAGE: Message = {
  id: "welcome",
  role: "assistant",
  content:
    "Welcome to STAGEONE. I'm your AI strategy advisor. Tell me about your business — what systems are you looking to build or automate?",
};

export function AiChatWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([WELCOME_MESSAGE]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [hasNewMessage, setHasNewMessage] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const abortRef = useRef<AbortController | null>(null);

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, scrollToBottom]);

  useEffect(() => {
    if (isOpen) {
      setHasNewMessage(false);
      setTimeout(() => inputRef.current?.focus(), 300);
    }
  }, [isOpen]);

  const sendMessage = useCallback(async () => {
    const text = input.trim();
    if (!text || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      content: text,
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);

    const assistantId = (Date.now() + 1).toString();
    const assistantMessage: Message = {
      id: assistantId,
      role: "assistant",
      content: "",
      isStreaming: true,
    };
    setMessages((prev) => [...prev, assistantMessage]);

    try {
      const conversationHistory = [...messages, userMessage]
        .filter((m) => m.id !== "welcome" || m.content !== WELCOME_MESSAGE.content)
        .map((m) => ({ role: m.role, content: m.content }));

      const controller = new AbortController();
      abortRef.current = controller;

      const response = await fetch("/api/ai/chat/stream", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: conversationHistory,
        }),
        signal: controller.signal,
      });

      if (!response.ok) {
        throw new Error("Request failed");
      }

      const reader = response.body?.getReader();
      const decoder = new TextDecoder();

      if (!reader) throw new Error("No response body");

      let accumulated = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value, { stream: true });
        const lines = chunk.split("\n");

        for (const line of lines) {
          if (line.startsWith("data: ")) {
            try {
              const data = JSON.parse(line.slice(6));
              if (data.delta) {
                accumulated += data.delta;
                setMessages((prev) =>
                  prev.map((m) =>
                    m.id === assistantId
                      ? { ...m, content: accumulated, isStreaming: true }
                      : m
                  )
                );
              }
              if (data.done) {
                setMessages((prev) =>
                  prev.map((m) =>
                    m.id === assistantId ? { ...m, isStreaming: false } : m
                  )
                );
              }
            } catch {
              // skip malformed chunks
            }
          }
        }
      }

      if (!isOpen) setHasNewMessage(true);
    } catch (err: unknown) {
      if (err instanceof Error && err.name === "AbortError") return;
      setMessages((prev) =>
        prev.map((m) =>
          m.id === assistantId
            ? {
                ...m,
                content:
                  "I'm having trouble connecting right now. Please try again or email us at hello@stageone.agency.",
                isStreaming: false,
              }
            : m
        )
      );
    } finally {
      setIsLoading(false);
    }
  }, [input, isLoading, messages, isOpen]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const handleClose = () => {
    abortRef.current?.abort();
    setIsOpen(false);
  };

  return (
    <>
      {/* Floating Trigger Button */}
      <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end gap-3">
        <AnimatePresence>
          {!isOpen && (
            <motion.div
              initial={{ opacity: 0, y: 10, scale: 0.8 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 10, scale: 0.8 }}
              className="bg-[#111] border border-[#C9A84C]/30 rounded-2xl px-4 py-3 text-sm text-white/80 shadow-xl backdrop-blur-md max-w-[200px] text-center"
              style={{ boxShadow: "0 0 20px rgba(201,168,76,0.15)" }}
            >
              <span className="text-[#C9A84C] font-medium">AI Advisor</span> ready
              <br />
              <span className="text-xs text-white/50">Ask anything</span>
            </motion.div>
          )}
        </AnimatePresence>

        <motion.button
          onClick={() => setIsOpen((v) => !v)}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          data-testid="button-ai-chat-toggle"
          className="relative w-14 h-14 rounded-2xl flex items-center justify-center shadow-2xl"
          style={{
            background: "linear-gradient(135deg, #1a1400 0%, #2a1f00 100%)",
            border: "1px solid rgba(201,168,76,0.6)",
            boxShadow:
              "0 0 30px rgba(201,168,76,0.3), 0 0 60px rgba(201,168,76,0.1), inset 0 1px 0 rgba(201,168,76,0.2)",
          }}
        >
          {hasNewMessage && !isOpen && (
            <span className="absolute -top-1 -right-1 w-3 h-3 rounded-full bg-[#C9A84C] animate-pulse" />
          )}
          <AnimatePresence mode="wait">
            {isOpen ? (
              <motion.div
                key="close"
                initial={{ rotate: -90, opacity: 0 }}
                animate={{ rotate: 0, opacity: 1 }}
                exit={{ rotate: 90, opacity: 0 }}
                transition={{ duration: 0.2 }}
              >
                <ChevronDown size={22} className="text-[#C9A84C]" />
              </motion.div>
            ) : (
              <motion.div
                key="open"
                initial={{ rotate: 90, opacity: 0 }}
                animate={{ rotate: 0, opacity: 1 }}
                exit={{ rotate: -90, opacity: 0 }}
                transition={{ duration: 0.2 }}
              >
                <img
                  src={faviconSrc}
                  alt="AI Chat"
                  style={{
                    width: 28,
                    height: 28,
                    objectFit: "contain",
                    mixBlendMode: "screen",
                    filter: "drop-shadow(0 0 4px rgba(201,168,76,0.9))",
                  }}
                />
              </motion.div>
            )}
          </AnimatePresence>
        </motion.button>
      </div>

      {/* Chat Panel */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className="fixed bottom-24 right-6 z-50 w-[380px] max-w-[calc(100vw-2rem)] flex flex-col rounded-2xl overflow-hidden"
            style={{
              background: "rgba(10, 8, 4, 0.95)",
              border: "1px solid rgba(201,168,76,0.2)",
              backdropFilter: "blur(20px)",
              boxShadow:
                "0 0 60px rgba(201,168,76,0.15), 0 25px 60px rgba(0,0,0,0.6)",
              height: "520px",
            }}
          >
            {/* Header */}
            <div
              className="flex items-center justify-between px-5 py-4 border-b"
              style={{ borderColor: "rgba(201,168,76,0.15)" }}
            >
              <div className="flex items-center gap-3">
                <div className="relative">
                  <div
                    className="absolute inset-0 rounded-full"
                    style={{
                      background:
                        "radial-gradient(circle, rgba(201,168,76,0.4) 0%, transparent 70%)",
                      filter: "blur(4px)",
                    }}
                  />
                  <img
                    src={faviconSrc}
                    alt=""
                    style={{
                      width: 28,
                      height: 28,
                      objectFit: "contain",
                      mixBlendMode: "screen",
                      filter: "drop-shadow(0 0 4px rgba(201,168,76,0.8))",
                      position: "relative",
                    }}
                  />
                </div>
                <div>
                  <p className="text-white font-semibold text-sm tracking-wide">
                    STAGEONE AI
                  </p>
                  <div className="flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                    <span className="text-xs text-white/40">
                      Strategy Advisor · Online
                    </span>
                  </div>
                </div>
              </div>
              <button
                onClick={handleClose}
                data-testid="button-ai-chat-close"
                className="w-8 h-8 rounded-lg flex items-center justify-center text-white/40 hover:text-white hover:bg-white/5 transition-all"
              >
                <X size={16} />
              </button>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4 scrollbar-thin">
              {messages.map((msg) => (
                <motion.div
                  key={msg.id}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`flex gap-3 ${msg.role === "user" ? "flex-row-reverse" : "flex-row"}`}
                >
                  {msg.role === "assistant" && (
                    <div className="flex-shrink-0 w-7 h-7 rounded-lg flex items-center justify-center"
                      style={{
                        background: "rgba(201,168,76,0.1)",
                        border: "1px solid rgba(201,168,76,0.2)",
                      }}
                    >
                      <Bot size={14} className="text-[#C9A84C]" />
                    </div>
                  )}
                  <div
                    className={`rounded-2xl px-4 py-3 text-sm leading-relaxed max-w-[80%] ${
                      msg.role === "user"
                        ? "text-white ml-auto rounded-tr-sm"
                        : "text-white/85 rounded-tl-sm"
                    }`}
                    style={
                      msg.role === "user"
                        ? {
                            background:
                              "linear-gradient(135deg, rgba(201,168,76,0.25), rgba(201,168,76,0.15))",
                            border: "1px solid rgba(201,168,76,0.3)",
                          }
                        : {
                            background: "rgba(255,255,255,0.04)",
                            border: "1px solid rgba(255,255,255,0.06)",
                          }
                    }
                  >
                    {msg.content}
                    {msg.isStreaming && (
                      <span className="inline-block w-1 h-4 bg-[#C9A84C] ml-1 animate-pulse rounded-sm align-middle" />
                    )}
                  </div>
                </motion.div>
              ))}
              {isLoading && messages[messages.length - 1]?.role !== "assistant" && (
                <div className="flex gap-3">
                  <div className="w-7 h-7 rounded-lg flex items-center justify-center"
                    style={{ background: "rgba(201,168,76,0.1)", border: "1px solid rgba(201,168,76,0.2)" }}
                  >
                    <Bot size={14} className="text-[#C9A84C]" />
                  </div>
                  <div className="rounded-2xl rounded-tl-sm px-4 py-3 flex items-center gap-2"
                    style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.06)" }}
                  >
                    <Loader2 size={14} className="text-[#C9A84C] animate-spin" />
                    <span className="text-white/40 text-xs">Thinking...</span>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <div
              className="px-4 py-4 border-t"
              style={{ borderColor: "rgba(201,168,76,0.1)" }}
            >
              <div
                className="flex items-end gap-3 rounded-xl px-4 py-3 transition-all"
                style={{
                  background: "rgba(255,255,255,0.03)",
                  border: "1px solid rgba(201,168,76,0.15)",
                }}
              >
                <textarea
                  ref={inputRef}
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Ask about AI automation, strategy..."
                  rows={1}
                  data-testid="input-ai-chat"
                  className="flex-1 bg-transparent text-white text-sm placeholder-white/25 resize-none outline-none leading-relaxed"
                  style={{ maxHeight: "80px", overflowY: "auto" }}
                />
                <motion.button
                  onClick={sendMessage}
                  disabled={!input.trim() || isLoading}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  data-testid="button-ai-chat-send"
                  className="flex-shrink-0 w-8 h-8 rounded-lg flex items-center justify-center disabled:opacity-30 transition-all"
                  style={{
                    background: input.trim()
                      ? "linear-gradient(135deg, #C9A84C, #A07830)"
                      : "rgba(201,168,76,0.1)",
                    border: "1px solid rgba(201,168,76,0.3)",
                  }}
                >
                  <Send size={14} className="text-black" />
                </motion.button>
              </div>
              <p className="text-xs text-white/20 text-center mt-2">
                Powered by NVIDIA AI · STAGEONE
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
