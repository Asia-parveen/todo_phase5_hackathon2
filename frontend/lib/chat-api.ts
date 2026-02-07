/**
 * Chat API Client for Phase 3 AI Chatbot
 *
 * Provides functions to interact with the chat endpoint.
 */

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

export interface ChatMessage {
  id: number;
  conversation_id: number;
  role: "user" | "assistant" | "tool";
  content: string;
  tool_calls?: any;
  timestamp: string;
}

export interface ChatResponse {
  success: boolean;
  response: string;
  conversation_id: number;
  message_id: number;
  timestamp: string;
}

export interface ChatError {
  success: false;
  error: string;
  message: string;
}

/**
 * Send a message to the AI chatbot
 *
 * @param userId - User ID from authentication
 * @param message - User's natural language message
 * @param token - JWT authentication token
 * @returns AI response or error
 */
export async function sendChatMessage(
  userId: number,
  message: string,
  token: string
): Promise<ChatResponse | ChatError> {
  try {
    const response = await fetch(`${API_BASE_URL}/api/${userId}/chat`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ message }),
    });

    if (!response.ok) {
      const error = await response.json();
      return {
        success: false,
        error: error.error || "REQUEST_FAILED",
        message: error.message || "Failed to send message",
      };
    }

    const data = await response.json();
    return data;
  } catch (error) {
    return {
      success: false,
      error: "NETWORK_ERROR",
      message: "Failed to connect to chat service",
    };
  }
}

// No separate history endpoint needed - all messages stored during chat
// The chatbot maintains conversation state on the server
