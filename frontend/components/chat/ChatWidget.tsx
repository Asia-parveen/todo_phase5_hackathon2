/**
 * ChatWidget Component - Main chat interface wrapper
 *
 * Combines ChatButton and ChatOverlay to provide complete chat functionality.
 * This is the component that gets added to the tasks page.
 */

"use client";

import React, { useState } from "react";
import ChatButton from "./ChatButton";
import ChatOverlay from "./ChatOverlay";
import ChatMessages from "./ChatMessages";
import ChatInput from "./ChatInput";
import { useChat } from "@/hooks/useChat";
import { ChatMessage as ChatMessageType } from "@/lib/chat-api";

interface ChatWidgetProps {
  userId: number;
  token: string;
  onTaskUpdate?: () => void;
}

export default function ChatWidget({ userId, token, onTaskUpdate }: ChatWidgetProps) {
  const [isOpen, setIsOpen] = useState(false);
  const {
    messages,
    sendMessage,
    isLoading,
    isHistoryLoading,
    error
  } = useChat({ userId, token, onTaskUpdate });

  const handleOpen = () => setIsOpen(true);
  const handleClose = () => setIsOpen(false);

  return (
    <>
      <ChatButton onClick={handleOpen} isOpen={isOpen} />

      <ChatOverlay isOpen={isOpen} onClose={handleClose}>
        <div className="flex flex-col h-full bg-white">
          {/* Messages area */}
          <div className="flex-1 overflow-y-auto">
            <ChatMessages
              messages={messages}
              isLoading={isHistoryLoading}
            />
          </div>

          {/* Error display */}
          {error && (
            <div className="px-4 py-2 bg-red-50 text-red-600 text-xs border-t border-red-100 italic">
              {error}
            </div>
          )}

          {/* Input area */}
          <div className="border-t border-gray-100 p-4 bg-gray-50">
            <ChatInput
              onSendMessage={sendMessage}
              isLoading={isLoading}
            />
          </div>
        </div>
      </ChatOverlay>
    </>
  );
}
