/**
 * ChatMessages Component - Display conversation history with typing indicator
 *
 * Shows user and AI messages in a scrollable list with animations.
 */

"use client";

import React, { useEffect, useRef } from "react";
import ChatMessage from "./ChatMessage";
import { ChatMessage as ChatMessageType } from "@/lib/chat-api";

interface ChatMessagesProps {
  messages: ChatMessageType[];
  isLoading?: boolean;
}

export default function ChatMessages({ messages, isLoading }: ChatMessagesProps) {
  const scrollRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isLoading]);

  const welcomeMessage: ChatMessageType = {
    id: 0,
    conversation_id: 0,
    role: "assistant" as const,
    content: "Hi! 👋 I'm your AI task assistant. I can help you:\n\n• Add tasks: 'Add task to buy groceries'\n• List tasks: 'Show my tasks'\n• Complete tasks: 'Complete task 30'\n• Update tasks: 'Update task 30 to buy milk'\n• Delete tasks: 'Delete task 30'\n\nWhat would you like to do?",
    timestamp: new Date().toISOString(),
  };

  return (
    <div
      ref={scrollRef}
      className="p-6 space-y-5 h-full overflow-y-auto"
    >
      {/* Welcome message */}
      {messages.length === 0 && !isLoading && (
        <div className="animate-slide-left">
          <ChatMessage message={welcomeMessage} />
        </div>
      )}

      {/* Chat messages */}
      {messages.map((msg, index) => (
        <div
          key={msg.id}
          className="animate-fade-in"
          style={{ animationDelay: `${index * 50}ms` }}
        >
          <ChatMessage message={msg} />
        </div>
      ))}

      {/* Typing indicator */}
      {isLoading && messages.length > 0 && (
        <div className="flex items-start gap-3 animate-fade-in">
          {/* AI avatar */}
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-600 via-pink-500 to-indigo-600 flex items-center justify-center shrink-0 shadow-md">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={1.5}
              stroke="currentColor"
              className="w-5 h-5 text-white"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09z"
              />
            </svg>
          </div>

          {/* Typing dots */}
          <div className="bg-white rounded-2xl border-2 border-purple-200 px-6 py-4 shadow-md">
            <div className="flex items-center gap-2">
              {/* Three animated dots */}
              <div className="typing-dot w-2 h-2 bg-purple-400 rounded-full" />
              <div className="typing-dot w-2 h-2 bg-purple-400 rounded-full" />
              <div className="typing-dot w-2 h-2 bg-purple-400 rounded-full" />
              <span className="ml-2 text-sm text-gray-400">AI is typing...</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
