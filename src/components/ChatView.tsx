import { useState, useRef, useEffect } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { Id } from "../../convex/_generated/dataModel";

interface ChatViewProps {
  conversationId: Id<"conversations">;
  coachId: Id<"coaches">;
  onBack: () => void;
}

const coachGradients: Record<string, string> = {
  SS: "from-blue-500 to-blue-600",
  JC: "from-emerald-500 to-emerald-600",
  NR: "from-purple-500 to-purple-600",
  BB: "from-rose-500 to-rose-600",
  AH: "from-amber-500 to-amber-600",
};

export function ChatView({ conversationId, coachId, onBack }: ChatViewProps) {
  const [message, setMessage] = useState("");
  const [isSending, setIsSending] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const coach = useQuery(api.coaches.get, { id: coachId });
  const messages = useQuery(api.conversations.getMessages, { conversationId });
  const sendMessage = useMutation(api.conversations.sendMessage);

  const gradient = coach ? coachGradients[coach.avatar] || "from-gray-500 to-gray-600" : "from-gray-500 to-gray-600";

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const handleSend = async () => {
    if (!message.trim() || isSending) return;

    const content = message.trim();
    setMessage("");
    setIsSending(true);

    try {
      await sendMessage({ conversationId, content });
    } catch (error) {
      console.error("Error sending message:", error);
      setMessage(content);
    } finally {
      setIsSending(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="h-[calc(100vh-65px)] md:h-[calc(100vh-73px)] flex flex-col">
      {/* Chat Header */}
      <div className="flex-shrink-0 px-4 md:px-6 py-3 md:py-4 bg-[#0a0a0f]/80 backdrop-blur-xl border-b border-white/5">
        <div className="max-w-3xl mx-auto flex items-center gap-3 md:gap-4">
          <button
            onClick={onBack}
            className="p-2 -ml-2 text-gray-400 hover:text-white transition-colors"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>

          {coach && (
            <>
              <div className={`w-10 h-10 md:w-11 md:h-11 rounded-xl bg-gradient-to-br ${gradient} flex items-center justify-center text-white font-bold text-sm shadow-lg`}>
                {coach.avatar}
              </div>
              <div className="flex-1 min-w-0">
                <h2 className="text-white font-semibold text-sm md:text-base truncate">{coach.name}</h2>
                <p className="text-xs text-gray-500 truncate">{coach.title}</p>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 md:px-6 py-4 md:py-6">
        <div className="max-w-3xl mx-auto space-y-4 md:space-y-6">
          {/* Welcome message if no messages */}
          {messages?.length === 0 && coach && (
            <div className="text-center py-8 md:py-12">
              <div className={`w-16 h-16 md:w-20 md:h-20 rounded-2xl bg-gradient-to-br ${gradient} flex items-center justify-center text-white font-bold text-xl md:text-2xl mx-auto mb-4 shadow-xl`}>
                {coach.avatar}
              </div>
              <h3 className="text-lg md:text-xl font-display font-bold text-white mb-2">
                Chat with {coach.name}
              </h3>
              <p className="text-gray-400 text-sm md:text-base max-w-md mx-auto mb-6">
                {coach.name} is ready to help you with {coach.expertise.toLowerCase()}. Ask anything about your goals!
              </p>
              <div className="flex flex-wrap justify-center gap-2">
                {[
                  "How do I get started?",
                  "What's the first step?",
                  "I'm feeling stuck...",
                ].map((prompt) => (
                  <button
                    key={prompt}
                    onClick={() => setMessage(prompt)}
                    className="px-3 md:px-4 py-2 text-xs md:text-sm bg-white/5 hover:bg-white/10 border border-white/10 rounded-full text-gray-300 transition-all"
                  >
                    {prompt}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Message list */}
          {messages?.map((msg: { _id: string; isFromUser: boolean; content: string }, index: number) => (
            <div
              key={msg._id}
              className={`flex ${msg.isFromUser ? "justify-end" : "justify-start"}`}
              style={{ animationDelay: `${index * 50}ms` }}
            >
              <div className={`flex gap-2 md:gap-3 max-w-[90%] md:max-w-[85%] ${msg.isFromUser ? "flex-row-reverse" : ""}`}>
                {!msg.isFromUser && coach && (
                  <div className={`flex-shrink-0 w-8 h-8 rounded-lg bg-gradient-to-br ${gradient} flex items-center justify-center text-white font-bold text-xs`}>
                    {coach.avatar}
                  </div>
                )}
                <div
                  className={`px-3 md:px-4 py-2.5 md:py-3 rounded-2xl text-sm md:text-base ${
                    msg.isFromUser
                      ? "bg-amber-500 text-white rounded-br-md"
                      : "bg-white/10 text-gray-100 rounded-bl-md"
                  }`}
                >
                  {msg.content}
                </div>
              </div>
            </div>
          ))}

          {/* Typing indicator */}
          {isSending && (
            <div className="flex justify-start">
              <div className="flex gap-2 md:gap-3 items-end">
                {coach && (
                  <div className={`flex-shrink-0 w-8 h-8 rounded-lg bg-gradient-to-br ${gradient} flex items-center justify-center text-white font-bold text-xs`}>
                    {coach.avatar}
                  </div>
                )}
                <div className="px-4 py-3 rounded-2xl rounded-bl-md bg-white/10">
                  <div className="flex gap-1">
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
                  </div>
                </div>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Input */}
      <div className="flex-shrink-0 px-4 md:px-6 py-3 md:py-4 bg-[#0a0a0f]/80 backdrop-blur-xl border-t border-white/5">
        <div className="max-w-3xl mx-auto">
          <div className="flex items-center gap-2 md:gap-3 bg-white/5 rounded-xl md:rounded-2xl border border-white/10 focus-within:border-amber-500/50 transition-colors p-1.5 md:p-2">
            <input
              ref={inputRef}
              type="text"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={`Ask ${coach?.name || "your coach"}...`}
              className="flex-1 bg-transparent px-2 md:px-3 py-2 md:py-2.5 text-white placeholder-gray-500 focus:outline-none text-sm md:text-base"
            />
            <button
              onClick={handleSend}
              disabled={!message.trim() || isSending}
              className="p-2.5 md:p-3 bg-amber-500 hover:bg-amber-400 disabled:bg-gray-600 disabled:cursor-not-allowed text-white rounded-lg md:rounded-xl transition-colors flex-shrink-0"
            >
              <svg className="w-4 h-4 md:w-5 md:h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
              </svg>
            </button>
          </div>
          <p className="text-[10px] md:text-xs text-gray-600 text-center mt-2">
            Press Enter to send · {coach?.name} responds with personalized advice
          </p>
        </div>
      </div>
    </div>
  );
}
