/**
 * Phase 3 AI Chatbot Page - Primary Task Management Interface
 * PHASE 5 ADDITION: Now includes task sidebar with filters and Phase 5 badges
 *
 * Users interact with their todo list entirely through natural language.
 * No manual CRUD forms or buttons are exposed.
 */

"use client";

import { useState, useCallback } from "react";
import { useChat } from "@/hooks/useChat";
import ChatFloatingBall from "@/components/chat/ChatFloatingBall";
import ChatMessages from "@/components/chat/ChatMessages";
import ChatInput from "@/components/chat/ChatInput";
import ChatTaskSidebar from "@/components/chat/ChatTaskSidebar";
import { getCurrentUser } from "@/lib/auth";
import { getAuthToken } from "@/lib/api";

export default function ChatPage() {
  const [isOpen, setIsOpen] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(true); // PHASE 5: Sidebar state
  const [refreshTrigger, setRefreshTrigger] = useState(0); // PHASE 5: Trigger sidebar refresh
  const user = getCurrentUser();
  const token = getAuthToken();

  // PHASE 5: Callback to refresh task list when chat modifies tasks
  const handleTaskUpdate = useCallback(() => {
    setRefreshTrigger((prev) => prev + 1);
  }, []);

  const {
    messages,
    sendMessage,
    isLoading,
    error,
  } = useChat({
    userId: Number(user?.id || 0),
    token: token || "",
    onTaskUpdate: handleTaskUpdate, // PHASE 5: Connect task refresh
  });

  const handleOpen = () => setIsOpen(true);
  const handleClose = () => setIsOpen(false);

  if (!user || !token) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-gray-500">Please log in to continue</div>
      </div>
    );
  }

  return (
    <div className="min-h-[600px] relative">
      {/* Welcome Message */}
      {!isOpen && (
        <div className="text-center py-12">
          <div className="w-24 h-24 mx-auto mb-6 rounded-full bg-gradient-to-br from-purple-600 via-pink-500 to-indigo-600 flex items-center justify-center shadow-xl shadow-purple-300 animate-pulse">
            <svg
              className="w-12 h-12 text-white"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z"
              />
            </svg>
          </div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-600 via-pink-500 to-indigo-600 bg-clip-text text-transparent mb-3">
            AI Task Assistant
          </h1>
          <p className="text-gray-600 text-lg max-w-md mx-auto mb-6">
            Manage your tasks naturally. Just tell me what you need to do!
          </p>
          {/* PHASE 5: Feature highlights */}
          <div className="flex flex-wrap justify-center gap-2 mb-6 max-w-lg mx-auto">
            <span className="px-3 py-1.5 bg-purple-100 text-purple-700 rounded-full text-sm font-medium">
              Priority Levels
            </span>
            <span className="px-3 py-1.5 bg-pink-100 text-pink-700 rounded-full text-sm font-medium">
              Due Dates
            </span>
            <span className="px-3 py-1.5 bg-indigo-100 text-indigo-700 rounded-full text-sm font-medium">
              Tags
            </span>
            <span className="px-3 py-1.5 bg-amber-100 text-amber-700 rounded-full text-sm font-medium">
              Search & Filter
            </span>
          </div>
          <div className="inline-block px-4 py-2 bg-purple-100 text-purple-700 rounded-full text-sm font-medium">
            Click the floating ball below to start chatting
          </div>
        </div>
      )}

      {/* Floating Chat Ball */}
      <ChatFloatingBall
        isOpen={isOpen}
        onClick={isOpen ? handleClose : handleOpen}
      />

      {/* Chat Interface (full screen with optional sidebar) */}
      {isOpen && (
        <div className="fixed inset-0 z-50 bg-gray-50 flex">
          {/* Main Chat Area */}
          <div className="flex-1 flex flex-col">
            {/* Header */}
            <div className="bg-white border-b border-gray-200 px-6 py-4 shadow-sm flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-600 via-pink-500 to-indigo-600 flex items-center justify-center shadow-md">
                  <svg
                    className="w-6 h-6 text-white"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.456 2.456L21.75 6l-1.035.259a3.375 3.375 0 00-2.456 2.456zM16.894 20.567L16.5 21.75l-.394-1.183a2.25 2.25 0 00-1.423-1.423L13.5 18.75l1.183-.394a2.25 2.25 0 001.423-1.423l.394-1.183.394 1.183a2.25 2.25 0 001.423 1.423l1.183.394-1.183.394a2.25 2.25 0 00-1.423 1.423z"
                    />
                  </svg>
                </div>
                <div>
                  <h2 className="text-xl font-semibold text-gray-900">AI Task Assistant</h2>
                  <p className="text-sm text-gray-500">Always ready to help</p>
                </div>
              </div>

              {/* Header Actions */}
              <div className="flex items-center gap-2">
                {/* PHASE 5: Toggle Sidebar Button */}
                <button
                  onClick={() => setSidebarOpen(!sidebarOpen)}
                  className={`p-2 rounded-lg transition-colors ${
                    sidebarOpen
                      ? "bg-purple-100 text-purple-600"
                      : "text-gray-400 hover:text-gray-600 hover:bg-gray-100"
                  }`}
                  title={sidebarOpen ? "Hide task list" : "Show task list"}
                >
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4"
                    />
                  </svg>
                </button>

                {/* Close Button */}
                <button
                  onClick={handleClose}
                  className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                  aria-label="Close chat"
                >
                  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>

            {/* Messages Area */}
            <div className="flex-1 overflow-y-auto">
              <div className="max-w-3xl mx-auto py-6 px-4">
                <ChatMessages
                  messages={messages}
                  isLoading={isLoading}
                />
              </div>
            </div>

            {/* Error Display */}
            {error && (
              <div className="mx-6 mb-4 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
                {error}
              </div>
            )}

            {/* Input Area */}
            <div className="bg-white border-t border-gray-200 p-4">
              <div className="max-w-3xl mx-auto">
                {/* PHASE 5: Hint about Phase 5 features */}
                <div className="mb-3 flex flex-wrap gap-2 text-xs">
                  <span className="text-gray-400">Try:</span>
                  <button
                    onClick={() => sendMessage("Add a high priority task to review project proposal due tomorrow")}
                    className="px-2 py-1 bg-purple-50 text-purple-600 rounded-full hover:bg-purple-100 transition-colors"
                  >
                    "Add high priority task due tomorrow"
                  </button>
                  <button
                    onClick={() => sendMessage("Show my tasks sorted by due date")}
                    className="px-2 py-1 bg-pink-50 text-pink-600 rounded-full hover:bg-pink-100 transition-colors"
                  >
                    "Sort by due date"
                  </button>
                  <button
                    onClick={() => sendMessage("Show my high priority tasks")}
                    className="px-2 py-1 bg-indigo-50 text-indigo-600 rounded-full hover:bg-indigo-100 transition-colors"
                  >
                    "Show high priority"
                  </button>
                </div>
                <ChatInput onSendMessage={sendMessage} isLoading={isLoading} />
              </div>
            </div>
          </div>

          {/* PHASE 5: Task Sidebar with filters and badges */}
          <ChatTaskSidebar
            isOpen={sidebarOpen}
            onClose={() => setSidebarOpen(false)}
            refreshTrigger={refreshTrigger}
          />
        </div>
      )}
    </div>
  );
}
