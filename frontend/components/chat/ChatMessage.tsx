/**
 * ChatMessage Component - Enhanced single message bubble with beautiful styling
 *
 * Displays user messages and AI responses with improved visuals.
 * AI responses can include formatted task lists with status indicators.
 * PHASE 5 ADDITION: Now displays priority, due date, tags badges on tasks.
 */

"use client";

import React from "react";
import { ChatMessage as ChatMessageType } from "@/lib/chat-api";
import { PRIORITY_CONFIG, RECURRENCE_CONFIG } from "@/lib/types";

interface ChatMessageProps {
  message: ChatMessageType;
}

// PHASE 5 ADDITION: Extended parsed task interface
interface ParsedTask {
  id: number;
  title: string;
  completed: boolean;
  // Phase 5 fields (optional - may not be in every response)
  priority?: "low" | "medium" | "high" | "critical";
  due_date?: string;
  tags?: string[];
  recurrence_pattern?: "daily" | "weekly" | "monthly";
}

/**
 * PHASE 5 ADDITION: Parse Phase 5 fields from extended task format
 * Supports formats like:
 * - Task 30: Buy groceries (pending) [priority:high] [due:2024-02-15] [tags:shopping,urgent]
 * - Task 30: Buy groceries (pending) - Priority: High, Due: Today
 */
function parsePhase5Fields(taskText: string): Partial<ParsedTask> {
  const result: Partial<ParsedTask> = {};

  // Parse priority - multiple formats
  const priorityMatch = taskText.match(/\[priority[:\s]*(\w+)\]|priority[:\s]*(\w+)/i);
  if (priorityMatch) {
    const priority = (priorityMatch[1] || priorityMatch[2])?.toLowerCase();
    if (["low", "medium", "high", "critical"].includes(priority)) {
      result.priority = priority as ParsedTask["priority"];
    }
  }

  // Parse due date
  const dueDateMatch = taskText.match(/\[due[:\s]*([^\]]+)\]|due[:\s]*(\d{4}-\d{2}-\d{2}|today|tomorrow)/i);
  if (dueDateMatch) {
    result.due_date = dueDateMatch[1] || dueDateMatch[2];
  }

  // Parse tags
  const tagsMatch = taskText.match(/\[tags[:\s]*([^\]]+)\]/i);
  if (tagsMatch) {
    result.tags = tagsMatch[1].split(",").map((t) => t.trim().toLowerCase());
  }

  // Parse recurrence
  const recurrenceMatch = taskText.match(/\[recur(?:rence)?[:\s]*(\w+)\]|repeats?\s+(\w+)/i);
  if (recurrenceMatch) {
    const recurrence = (recurrenceMatch[1] || recurrenceMatch[2])?.toLowerCase();
    if (["daily", "weekly", "monthly"].includes(recurrence)) {
      result.recurrence_pattern = recurrence as ParsedTask["recurrence_pattern"];
    }
  }

  return result;
}

/**
 * PHASE 5 ADDITION: Inline badge component for chat task cards
 */
function ChatTaskBadges({ task }: { task: ParsedTask }) {
  const hasBadges =
    (task.priority && task.priority !== "medium") ||
    task.due_date ||
    (task.tags && task.tags.length > 0) ||
    task.recurrence_pattern;

  if (!hasBadges) return null;

  // Format due date
  const formatDueDate = (dateStr?: string) => {
    if (!dateStr) return null;
    if (dateStr.toLowerCase() === "today") return "Today";
    if (dateStr.toLowerCase() === "tomorrow") return "Tomorrow";
    try {
      const date = new Date(dateStr);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const dateOnly = new Date(date);
      dateOnly.setHours(0, 0, 0, 0);
      if (dateOnly < today) {
        const diffDays = Math.ceil((today.getTime() - dateOnly.getTime()) / (1000 * 60 * 60 * 24));
        return `${diffDays}d overdue`;
      }
      return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
    } catch {
      return dateStr;
    }
  };

  const priorityConfig = task.priority ? PRIORITY_CONFIG[task.priority] : null;
  const isOverdue = task.due_date && !task.completed && formatDueDate(task.due_date)?.includes("overdue");

  return (
    <div className="flex flex-wrap gap-1.5 mt-2">
      {/* Priority Badge */}
      {task.priority && task.priority !== "medium" && priorityConfig && (
        <span className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-semibold border ${priorityConfig.color}`}>
          {task.priority === "critical" && (
            <svg className="w-2.5 h-2.5 mr-0.5" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
          )}
          {priorityConfig.label}
        </span>
      )}

      {/* Due Date Badge */}
      {task.due_date && (
        <span className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-semibold border ${
          isOverdue ? "bg-red-50 text-red-700 border-red-200" : "bg-indigo-50 text-indigo-700 border-indigo-200"
        }`}>
          <svg className="w-2.5 h-2.5 mr-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
          {formatDueDate(task.due_date)}
        </span>
      )}

      {/* Recurrence Badge */}
      {task.recurrence_pattern && (
        <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-semibold bg-purple-50 text-purple-700 border border-purple-200">
          <svg className="w-2.5 h-2.5 mr-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
          {RECURRENCE_CONFIG[task.recurrence_pattern]?.label || task.recurrence_pattern}
        </span>
      )}

      {/* Tags */}
      {task.tags && task.tags.slice(0, 2).map((tag) => (
        <span key={tag} className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-medium bg-gray-100 text-gray-600 border border-gray-200">
          #{tag}
        </span>
      ))}
      {task.tags && task.tags.length > 2 && (
        <span className="text-[10px] text-gray-400">+{task.tags.length - 2}</span>
      )}
    </div>
  );
}

/**
 * Parse AI message content and render rich task lists
 * PHASE 5 ADDITION: Now parses and displays Phase 5 fields
 */
function renderMessageContent(content: string): React.ReactNode {
  // Parse task lists from plain text - enhanced pattern for Phase 5
  // Matches: "Task 30: Buy groceries (pending)" with optional Phase 5 suffix
  const taskPattern = /Task (\d+):\s*([^\(\[]+)\s*\((pending|completed)\)([^\n]*)?/gi;
  const tasks: ParsedTask[] = [];
  let match;

  while ((match = taskPattern.exec(content)) !== null) {
    const baseTask: ParsedTask = {
      id: parseInt(match[1]),
      title: match[2].trim(),
      completed: match[3].toLowerCase() === "completed",
    };

    // PHASE 5: Parse additional fields from the rest of the line
    if (match[4]) {
      const phase5Fields = parsePhase5Fields(match[4]);
      Object.assign(baseTask, phase5Fields);
    }

    tasks.push(baseTask);
  }

  // If tasks found, render them with beautiful cards + Phase 5 badges
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

              {/* Task title, Phase 5 badges, and status */}
              <div className="flex-1 min-w-0">
                <p
                  className={`
                    text-base font-semibold
                    ${task.completed ? 'text-green-800 line-through' : 'text-gray-900'}
                  `}
                >
                  {task.title}
                </p>

                {/* PHASE 5 ADDITION: Render badges */}
                <ChatTaskBadges task={task} />
              </div>

              {/* Beautiful status badge */}
              <div
                className={`
                  flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-full shadow-sm shrink-0
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
              d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.456 2.456L21.75 6l-1.035.259a3.375 3.375 0 00-2.456 2.456zM16.894 20.567L16.5 21.75l-.394-1.183a2.25 2.25 0 00-1.423-1.423L13.5 18.75l1.183-.394a2.25 2.25 0 001.423-1.423l.394-1.183.394 1.183a2.25 2.25 0 001.423 1.423l1.183.394-1.183.394a2.25 2.25 0 00-1.423 1.423z"
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
