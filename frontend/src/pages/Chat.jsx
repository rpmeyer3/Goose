import { useState, useRef, useEffect } from "react";
import { motion } from "framer-motion";
import { FadeInSection } from "../components/MagicEffects";

const API_BASE = import.meta.env.VITE_API_URL || "";

export default function Chat({ data }) {
  const [messages, setMessages] = useState(() => {
    // Initialize with context-aware greeting based on whether data exists
    const greeting = data
      ? {
          id: 1,
          sender: "advisor",
          text: `Greetings, financial explorer! 🧙 I've analyzed your spending and I'm ready to help. Ask me anything about your finances, budget optimization, or spending habits!`,
        }
      : {
          id: 1,
          sender: "advisor",
          text: "Greetings, curious financial explorer! 🧙 I'm your AI Financial Advisor, powered by Gemini's mystical wisdom. Upload a bank statement first on the Home page to get started, then ask me anything about your finances!",
        };
    return [greeting];
  });
  const [inputValue, setInputValue] = useState("");
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = async () => {
    if (!inputValue.trim()) return;

    // Add user message
    const userMessage = {
      id: messages.length + 1,
      sender: "user",
      text: inputValue,
    };
    setMessages((prev) => [...prev, userMessage]);
    setInputValue("");

    if (!data) {
      setMessages((prev) => [
        ...prev,
        {
          id: prev.length + 1,
          sender: "advisor",
          text: "Please upload a bank statement first on the Home page so I can analyze your spending! 📊",
        },
      ]);
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(`${API_BASE}/api/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: inputValue,
          spending_data: data.metrics,
          transaction_count: data.transactions.length,
        }),
      });

      if (!response.ok) throw new Error("Failed to get response");
      const result = await response.json();

      setMessages((prev) => [
        ...prev,
        {
          id: prev.length + 1,
          sender: "advisor",
          text: result.response,
        },
      ]);
    } catch (error) {
      console.error("Chat error:", error);
      setMessages((prev) => [
        ...prev,
        {
          id: prev.length + 1,
          sender: "advisor",
          text: "The spell failed! 🔮 Please try again.",
        },
      ]);
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-dark-wizard via-dark-wizard to-[#0f0a1f] px-4 sm:px-8 py-12">
      <FadeInSection>
        <div className="max-w-3xl mx-auto">
          <h1 className="text-4xl sm:text-5xl font-wizard-bold text-center text-transparent bg-clip-text bg-gradient-to-r from-wizard-gold via-purple-400 to-wizard-gold mb-2">
            🧙 Financial Advisor
          </h1>
          <p className="text-center text-purple-300/70 mb-8">
            Chat with your AI-powered Gemini advisor about your spending habits
          </p>

          {/* Chat Container */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-wizard-dark/60 backdrop-blur-lg border border-purple-500/30 rounded-2xl shadow-2xl overflow-hidden flex flex-col h-[500px] sm:h-[600px]"
          >
            {/* Messages Area */}
            <div className="flex-1 overflow-y-auto p-6 space-y-4">
              {messages.map((msg, idx) => (
                <motion.div
                  key={msg.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.05 }}
                  className={`flex ${
                    msg.sender === "user" ? "justify-end" : "justify-start"
                  }`}
                >
                  <div
                    className={`max-w-xs sm:max-w-md lg:max-w-lg px-4 py-3 rounded-lg ${
                      msg.sender === "user"
                        ? "bg-gradient-to-r from-purple-600 to-violet-600 text-white rounded-tr-none"
                        : "bg-dark-purple/40 border border-purple-500/30 text-purple-100 rounded-tl-none"
                    }`}
                  >
                    <p className="text-sm sm:text-base">{msg.text}</p>
                  </div>
                </motion.div>
              ))}
              {loading && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="flex justify-start"
                >
                  <div className="bg-dark-purple/40 border border-purple-500/30 px-4 py-3 rounded-lg rounded-tl-none">
                    <div className="flex space-x-2">
                      <div className="w-2 h-2 bg-purple-400 rounded-full animate-bounce"></div>
                      <div className="w-2 h-2 bg-purple-400 rounded-full animate-bounce" style={{ animationDelay: "0.1s" }}></div>
                      <div className="w-2 h-2 bg-purple-400 rounded-full animate-bounce" style={{ animationDelay: "0.2s" }}></div>
                    </div>
                  </div>
                </motion.div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Input Area */}
            <div className="border-t border-purple-500/20 p-4 bg-dark-wizard/40">
              <div className="flex gap-3">
                <input
                  type="text"
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  onKeyPress={(e) => {
                    if (e.key === "Enter" && !loading) handleSendMessage();
                  }}
                  placeholder="Ask me about your spending..."
                  disabled={loading}
                  className="flex-1 bg-dark-purple/40 border border-purple-500/30 rounded-lg px-4 py-3 text-gray-900 placeholder-purple-300 focus:outline-none focus:border-purple-500/60 focus:ring-1 focus:ring-purple-500/30 transition disabled:opacity-50"
                />
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={handleSendMessage}
                  disabled={loading || !inputValue.trim()}
                  className="bg-gradient-to-r from-wizard-gold to-yellow-500 text-dark-wizard font-bold px-6 py-3 rounded-lg hover:shadow-lg hover:shadow-yellow-500/50 disabled:opacity-50 disabled:cursor-not-allowed transition"
                >
                  Send
                </motion.button>
              </div>
            </div>
          </motion.div>

          {/* Info Box */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="mt-8 bg-dark-purple/30 border border-purple-500/20 rounded-lg p-6"
          >
            <h3 className="text-purple-300 font-bold mb-3">💡 Try asking:</h3>
            <ul className="text-purple-200/70 text-sm space-y-2">
              <li>✨ "How can I save more money?"</li>
              <li>✨ "Why am I spending so much on [category]?"</li>
              <li>✨ "What's my average daily spending?"</li>
              <li>✨ "Give me personalized budget advice"</li>
            </ul>
          </motion.div>
        </div>
      </FadeInSection>
    </div>
  );
}
