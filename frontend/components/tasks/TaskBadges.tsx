"use client";

// PHASE 5 ADDITION – SAFE: Display badges for priority, due date, tags, recurrence

import { Task, PRIORITY_CONFIG, RECURRENCE_CONFIG } from "@/lib/types";

interface TaskBadgesProps {
  task: Task;
  compact?: boolean;
}

export default function TaskBadges({ task, compact = false }: TaskBadgesProps) {
  const priority = task.priority || "medium";
  const priorityConfig = PRIORITY_CONFIG[priority as keyof typeof PRIORITY_CONFIG];

  // Format due date for display
  const formatDueDate = (dateStr: string | null | undefined) => {
    if (!dateStr) return null;
    const date = new Date(dateStr);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    const dateOnly = new Date(date);
    dateOnly.setHours(0, 0, 0, 0);

    if (dateOnly.getTime() === today.getTime()) return "Today";
    if (dateOnly.getTime() === tomorrow.getTime()) return "Tomorrow";

    // Check if overdue
    if (dateOnly < today) {
      const diffDays = Math.ceil((today.getTime() - dateOnly.getTime()) / (1000 * 60 * 60 * 24));
      return `${diffDays}d overdue`;
    }

    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
    });
  };

  const formattedDueDate = formatDueDate(task.due_date);
  const isOverdue = task.due_date && new Date(task.due_date) < new Date() && !task.completed;

  // Don't show badges if no Phase 5 data exists (backward compatible)
  const hasBadges =
    (priority && priority !== "medium") ||
    task.due_date ||
    (task.tags && task.tags.length > 0) ||
    task.recurrence_pattern;

  if (!hasBadges) return null;

  return (
    <div className={`flex flex-wrap gap-2 ${compact ? "mt-2" : "mt-3"}`}>
      {/* Priority Badge - Only show if not medium (default) */}
      {priority && priority !== "medium" && priorityConfig && (
        <span
          className={`inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-medium border ${priorityConfig.color} transition-all duration-300`}
        >
          {priority === "critical" && (
            <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
              <path
                fillRule="evenodd"
                d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                clipRule="evenodd"
              />
            </svg>
          )}
          {priority === "high" && (
            <svg className="w-3 h-3 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
            </svg>
          )}
          {priority === "low" && (
            <svg className="w-3 h-3 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          )}
          {priorityConfig.label}
        </span>
      )}

      {/* Due Date Badge */}
      {formattedDueDate && (
        <span
          className={`inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-medium border transition-all duration-300 ${
            isOverdue
              ? "bg-red-50 text-red-700 border-red-200"
              : "bg-indigo-50 text-indigo-700 border-indigo-200"
          }`}
        >
          <svg className="w-3 h-3 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
            />
          </svg>
          {formattedDueDate}
        </span>
      )}

      {/* Recurrence Badge */}
      {task.recurrence_pattern && (
        <span className="inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-medium bg-purple-50 text-purple-700 border border-purple-200 transition-all duration-300">
          <svg className="w-3 h-3 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
            />
          </svg>
          {RECURRENCE_CONFIG[task.recurrence_pattern as keyof typeof RECURRENCE_CONFIG]?.label ||
            task.recurrence_pattern}
        </span>
      )}

      {/* Tags */}
      {task.tags && task.tags.length > 0 && (
        <>
          {task.tags.slice(0, compact ? 2 : 5).map((tag) => (
            <span
              key={tag}
              className="inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-medium bg-gray-100 text-gray-600 border border-gray-200 transition-all duration-300"
            >
              #{tag}
            </span>
          ))}
          {task.tags.length > (compact ? 2 : 5) && (
            <span className="inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-medium bg-gray-50 text-gray-500 border border-gray-200">
              +{task.tags.length - (compact ? 2 : 5)} more
            </span>
          )}
        </>
      )}
    </div>
  );
}
