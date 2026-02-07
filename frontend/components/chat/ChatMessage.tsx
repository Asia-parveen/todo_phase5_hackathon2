/**
 * ChatMessage Component - Enhanced single message bubble with beautiful styling
 *
 * Displays user messages and AI responses with improved visuals.
 * AI responses can include formatted task lists with status indicators.
 */

"use client";

import React from "react";
import { ChatMessage as ChatMessageType } from "@/lib/chat-api";

interface ChatMessageProps {
  message: ChatMessageType;
}

/**
 * Parse AI message content and render rich task lists
 */
function renderMessageContent(content: string): React.ReactNode {
  // Parse task lists from plain text
  const taskPattern = /Task (\d+):\s*([^\(]+)\s*\((pending|completed)\)/gi;
  const tasks: Array<{ id: number; title: string; completed: boolean }> = [];
  let match;

  while ((match = taskPattern.exec(content)) !== null) {
    tasks.push({
      id: parseInt(match[1]),
      title: match[2].trim(),
      completed: match[3].toLowerCase() === "completed",
    });
  }

  // If tasks found, render them with beautiful cards
  if (tasks.length > 0) {
    return (
      <div className="space-y-3 mt-4">
        {tasks.map((task) => (
          <div
            key={task.id}
            className={`
              bg-gradient-to-br ${task.completed ? 'from-green-50/80 to-emerald-50/80' : 'from-purple-50/80 to-pink-50/80'}
              rounded-2xl border-2 p-4 shadow-lg backdrop-blur-sm
              transition-all duration-300 hover:scale-[1.02]
              ${task.completed ? 'border-green-200' : 'border-purple-200'}
            `}
          >
            <div className="flex items-start gap-4">
              {/* Task number badge with glow */}
              <div
                className={`
                  w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold shrink-0 shadow-md
                  ${task.completed
                    ? 'bg-gradient-to-br from-green-500 to-emerald-500 text-white shadow-green-500/30'
                    : 'bg-gradient-to-br from-purple-500 to-pink-500 text-white shadow-purple-500/30'
                  }
                `}
              >
                {task.id}
              </div>

              {/* Task title and status */}
              <div className="flex-1 min-w-0">
                <p
                  className={`
                    text-base font-semibold
                    ${task.completed ? 'text-green-800 line-through' : 'text-gray-900'}
                  `}
                >
                  {task.title}
                </p>
              </div>

              {/* Beautiful status badge */}
              <div
                className={`
                  flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-full shadow-sm
                  ${task.completed
                    ? 'bg-gradient-to-r from-green-100 to-emerald-100 text-green-800 border border-green-200'
                    : 'bg-gradient-to-r from-amber-100 to-yellow-100 text-amber-800 border border-amber-200'
                  }
                `}
              >
                {task.completed ? (
                  <>
                    <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20">
                      <path
                        fillRule="evenodd"
                        d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                        clipRule="evenodd"
                      />
                    </svg>
                    Done
                  </>
                ) : (
                  <>
                    <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20">
                      <path
                        fillRule="evenodd"
                        d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z"
                        clipRule="evenodd"
                      />
                    </svg>
                    Pending
                  </>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  // Default: render as plain text with better typography
  return (
    <p className="text-base leading-relaxed whitespace-pre-wrap text-gray-700">
      {content}
    </p>
  );
}

export default function ChatMessage({ message }: ChatMessageProps) {
  const isUser = message.role === "user";
  const isAssistant = message.role === "assistant";

  if (message.role === "tool") {
    return null;
  }

  return (
    <div
      className={`flex ${isUser ? "justify-end" : "justify-start"} mb-4 animate-fade-in`}
    >
      {!isUser && (
        <div className="w-12 h-12 rounded-full bg-gradient-to-br from-purple-600 via-pink-500 to-indigo-600 flex items-center justify-center mr-3 shrink-0 shadow-xl shadow-purple-500/30">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={1.5}
            stroke="currentColor"
            className="w-6 h-6 text-white"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09z"
            />
          </svg>
        </div>
      )}

      <div className="max-w-[85%]">
        <div
          className={`${
            isUser
              ? "chat-bubble-user rounded-2xl rounded-br-none animate-slide-right"
              : "chat-bubble-assistant rounded-2xl rounded-bl-none animate-slide-left"
          }`}
        >
          <div className="px-6 py-4">
            {isAssistant ? renderMessageContent(message.content) : (
              <p className="text-base leading-relaxed whitespace-pre-wrap text-white font-medium">
                {message.content}
              </p>
            )}
          </div>
        </div>

        {/* Timestamp */}
        <div
          className={`text-[11px] mt-1.5 flex items-center gap-1.5 ${
            isUser ? "text-blue-200/80 justify-end" : "text-gray-400 justify-start"
          }`}
        >
          {new Date(message.timestamp).toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
          })}
          {isAssistant && (
            <span className="text-purple-500/60">AI Assistant</span>
          )}
        </div>
      </div>
    </div>
  );
}
