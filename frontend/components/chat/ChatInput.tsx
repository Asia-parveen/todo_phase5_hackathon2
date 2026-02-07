/**
 * ChatInput Component - Enhanced message input with beautiful send button
 *
 * Allows users to type messages and send them to the AI.
 */

"use client";

import React, { useState } from "react";

interface ChatInputProps {
  onSendMessage: (message: string) => Promise<void>;
  isLoading: boolean;
}

export default function ChatInput({ onSendMessage, isLoading }: ChatInputProps) {
  const [message, setMessage] = useState("");
  const [isFocused, setIsFocused] = useState(false);

  const handleSend = async () => {
    if (!message.trim() || isLoading) return;

    const userMessage = message;
    setMessage(""); // Clear input immediately
    await onSendMessage(userMessage);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="flex items-end gap-3 bg-white/90 backdrop-blur-sm rounded-2xl border-2 border-purple-200 p-3 shadow-lg transition-all duration-300 focus-within:shadow-xl focus-within:border-purple-400">
      <div className="flex-1 relative">
        <textarea
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          onKeyDown={handleKeyPress}
          placeholder="Tell me what you need to do..."
          className="w-full resize-none rounded-xl border-0 px-4 py-3.5 text-base focus:outline-none min-h-[52px] max-h-[150px] transition-all text-gray-800 placeholder-gray-400"
          rows={1}
          disabled={isLoading}
          style={{ fontFamily: 'system-ui, -apple-system, sans-serif' }}
        />

        {/* Animated border when focused */}
        {isFocused && (
          <div className="absolute inset-0 rounded-xl border-2 border-purple-400 pointer-events-none animate-pulse" />
        )}

        {/* Character count indicator */}
        {message.length > 0 && (
          <div className="absolute bottom-2 right-3 text-xs text-gray-400 bg-white/80 px-1.5 py-0.5 rounded-md">
            {message.length}/500
          </div>
        )}
      </div>

      {/* Send button with glow effect */}
      <button
        onClick={handleSend}
        disabled={!message.trim() || isLoading}
        className={`
          p-3.5 rounded-xl font-semibold transition-all flex items-center justify-center shrink-0
          ${!message.trim() || isLoading
            ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
            : 'bg-gradient-to-br from-purple-600 via-pink-500 to-indigo-600 text-white hover:shadow-lg hover:scale-105 active:scale-95'
          }
        `}
        title="Send message"
      >
        {isLoading ? (
          /* Loading spinner */
          <svg
            className="animate-spin h-5 w-5"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            ></circle>
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            ></path>
          </svg>
        ) : (
          /* Send icon with arrow */
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={2.5}
            stroke="currentColor"
            className="w-5 h-5"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M6 12L3.269 3.126A59.768 59.768 0 0121.485 12 59.77 59.77 0 013.27 20.876L5.999 12zm0 0h7.5"
            />
          </svg>
        )}
      </button>
    </div>
  );
}
