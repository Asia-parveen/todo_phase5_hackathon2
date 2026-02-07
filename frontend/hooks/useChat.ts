/**
 * useChat Hook - Chat state management for Phase 3
 *
 * Manages chat messages, sending, and optimistic UI updates
 */

import { useState, useCallback } from "react";
import { sendChatMessage, type ChatMessage, type ChatResponse } from "../lib/chat-api";

interface UseChatOptions {
  userId: number;
  token: string;
  onTaskUpdate?: () => void; // Callback to refresh Phase 2 task list
}

export function useChat({ userId, token, onTaskUpdate }: UseChatOptions) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const sendMessage = useCallback(
    async (userMessage: string) => {
      if (!userMessage.trim()) return;

      setIsLoading(true);
      setError(null);

      // Add user message optimistically
      const userMsg: ChatMessage = {
        id: Date.now(), // Temporary ID
        conversation_id: 0,
        role: "user",
        content: userMessage,
        timestamp: new Date().toISOString(),
      };
      setMessages((prev) => [...prev, userMsg]);

      try {
        // Send to backend
        const response: any = await sendChatMessage(userId, userMessage, token);

        if (response && "success" in response && !response.success) {
          setError(response.message || "Failed to send message");
          return;
        }

        // Add AI response
        const aiMsg: ChatMessage = {
          id: response.message_id,
          conversation_id: response.conversation_id,
          role: "assistant",
          content: response.response,
          timestamp: response.timestamp,
        };
        setMessages((prev) => [...prev, aiMsg]);

        // Trigger Phase 2 task list refresh (optimistic update)
        if (onTaskUpdate) {
          onTaskUpdate();
        }
      } catch (err) {
        setError("Failed to send message");
        console.error("Chat error:", err);
      } finally {
        setIsLoading(false);
      }
    },
    [userId, token, onTaskUpdate]
  );

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  return {
    messages,
    isLoading,
    isHistoryLoading: false, // Type-only fix: matches ChatWidget expectations without changing logic
    error,
    sendMessage,
    clearError,
  };
}
