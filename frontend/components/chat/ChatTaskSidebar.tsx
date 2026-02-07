"use client";

/**
 * PHASE 5 ADDITION – SAFE: Task sidebar for chat interface
 * Displays real task list with Phase 5 badges alongside chat
 * Syncs automatically when tasks are modified through chat
 */

import { useState, useEffect, useCallback } from "react";
import { Task, TaskFilterParams, PRIORITY_CONFIG } from "@/lib/types";
import { api, getAuthToken } from "@/lib/api";
import TaskBadges from "@/components/tasks/TaskBadges";

interface ChatTaskSidebarProps {
  refreshTrigger?: number; // Increment to force refresh
  onClose?: () => void;
  isOpen: boolean;
}

export default function ChatTaskSidebar({
  refreshTrigger = 0,
  onClose,
  isOpen,
}: ChatTaskSidebarProps) {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filter state
  const [filters, setFilters] = useState<TaskFilterParams>({
    sort_by: "created_at",
    order: "desc",
  });
  const [searchQuery, setSearchQuery] = useState("");
  const [showFilters, setShowFilters] = useState(false);

  // Fetch tasks
  const fetchTasks = useCallback(async () => {
    const token = getAuthToken();
    if (!token) return;

    try {
      setLoading(true);
      setError(null);

      const params = new URLSearchParams();
      if (searchQuery.trim()) params.append("query", searchQuery.trim());
      if (filters.status) params.append("status", filters.status);
      if (filters.priority) params.append("priority", filters.priority);
      if (filters.has_due_date !== undefined) {
        params.append("has_due_date", String(filters.has_due_date));
      }
      if (filters.sort_by) params.append("sort_by", filters.sort_by);
      if (filters.order) params.append("order", filters.order);

      const queryString = params.toString();
      const endpoint = searchQuery.trim()
        ? `/api/search/search${queryString ? `?${queryString}` : ""}`
        : `/api/tasks${queryString ? `?${queryString}` : ""}`;

      const data = await api.get<Task[]>(endpoint);
      setTasks(data);
    } catch (err) {
      setError("Failed to load tasks");
      console.error("Task fetch error:", err);
    } finally {
      setLoading(false);
    }
  }, [filters, searchQuery]);

  // Fetch on mount and when refreshTrigger changes
  useEffect(() => {
    if (isOpen) {
      fetchTasks();
    }
  }, [fetchTasks, refreshTrigger, isOpen]);

  // Toggle task completion
  const handleToggleComplete = async (task: Task) => {
    try {
      await api.patch<Task>(`/api/tasks/${task.id}/complete`);
      fetchTasks(); // Refresh list
    } catch (err) {
      console.error("Failed to toggle task:", err);
    }
  };

  if (!isOpen) return null;

  const pendingCount = tasks.filter((t) => !t.completed).length;
  const completedCount = tasks.filter((t) => t.completed).length;

  return (
    <div className="w-80 bg-white border-l border-gray-200 flex flex-col h-full shadow-lg">
      {/* Header */}
      <div className="p-4 border-b border-gray-200 bg-gradient-to-r from-purple-50 to-pink-50">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-lg font-semibold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
            My Tasks
          </h3>
          <button
            onClick={onClose}
            className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-white/50 rounded-lg transition-colors"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Stats */}
        <div className="flex gap-3 text-xs">
          <span className="px-2 py-1 bg-amber-100 text-amber-700 rounded-full font-medium">
            {pendingCount} pending
          </span>
          <span className="px-2 py-1 bg-green-100 text-green-700 rounded-full font-medium">
            {completedCount} done
          </span>
        </div>
      </div>

      {/* Search & Filter Toggle */}
      <div className="p-3 border-b border-gray-100">
        <div className="flex gap-2">
          <div className="flex-1 relative">
            <svg
              className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search tasks..."
              className="w-full pl-9 pr-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-200 focus:border-purple-400 transition-all"
            />
          </div>
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`p-2 rounded-lg border transition-all ${
              showFilters
                ? "border-purple-400 bg-purple-50 text-purple-600"
                : "border-gray-200 text-gray-500 hover:border-purple-300 hover:bg-purple-50"
            }`}
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
            </svg>
          </button>
        </div>

        {/* Filter Panel */}
        {showFilters && (
          <div className="mt-3 space-y-2 animate-slide-in">
            {/* Status Filter */}
            <select
              value={filters.status || ""}
              onChange={(e) => setFilters({ ...filters, status: e.target.value as TaskFilterParams["status"] || undefined })}
              className="w-full px-3 py-1.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-200"
            >
              <option value="">All Status</option>
              <option value="pending">Pending</option>
              <option value="completed">Completed</option>
            </select>

            {/* Priority Filter */}
            <select
              value={filters.priority || ""}
              onChange={(e) => setFilters({ ...filters, priority: e.target.value as TaskFilterParams["priority"] || undefined })}
              className="w-full px-3 py-1.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-200"
            >
              <option value="">All Priorities</option>
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
              <option value="critical">Critical</option>
            </select>

            {/* Sort */}
            <div className="flex gap-2">
              <select
                value={filters.sort_by || "created_at"}
                onChange={(e) => setFilters({ ...filters, sort_by: e.target.value as TaskFilterParams["sort_by"] })}
                className="flex-1 px-3 py-1.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-200"
              >
                <option value="created_at">Sort: Created</option>
                <option value="due_date">Sort: Due Date</option>
                <option value="priority">Sort: Priority</option>
                <option value="title">Sort: Title</option>
              </select>
              <button
                onClick={() => setFilters({ ...filters, order: filters.order === "asc" ? "desc" : "asc" })}
                className="px-3 py-1.5 border border-gray-200 rounded-lg text-gray-500 hover:bg-gray-50 transition-colors"
              >
                {filters.order === "asc" ? "↑" : "↓"}
              </button>
            </div>

            {/* Clear Filters */}
            <button
              onClick={() => {
                setFilters({ sort_by: "created_at", order: "desc" });
                setSearchQuery("");
              }}
              className="text-xs text-purple-600 hover:text-purple-800 font-medium"
            >
              Clear filters
            </button>
          </div>
        )}
      </div>

      {/* Task List */}
      <div className="flex-1 overflow-y-auto p-3 space-y-2">
        {loading ? (
          <div className="flex justify-center py-8">
            <div className="w-6 h-6 border-2 border-purple-500 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : error ? (
          <div className="text-center py-8 text-red-500 text-sm">{error}</div>
        ) : tasks.length === 0 ? (
          <div className="text-center py-8 text-gray-500 text-sm">
            No tasks found. Try saying "Add a task to buy groceries" in the chat!
          </div>
        ) : (
          tasks.map((task) => (
            <div
              key={task.id}
              className={`p-3 rounded-xl border-2 transition-all duration-200 hover:shadow-md ${
                task.completed
                  ? "bg-gradient-to-br from-green-50 to-emerald-50 border-green-200"
                  : "bg-gradient-to-br from-white to-purple-50/30 border-purple-100 hover:border-purple-200"
              }`}
            >
              <div className="flex items-start gap-2">
                {/* Checkbox */}
                <button
                  onClick={() => handleToggleComplete(task)}
                  className={`w-5 h-5 rounded-md border-2 flex items-center justify-center shrink-0 mt-0.5 transition-all ${
                    task.completed
                      ? "bg-gradient-to-br from-green-500 to-emerald-500 border-transparent"
                      : "border-purple-300 hover:border-purple-500 hover:bg-purple-50"
                  }`}
                >
                  {task.completed && (
                    <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                    </svg>
                  )}
                </button>

                {/* Task Content */}
                <div className="flex-1 min-w-0">
                  <p
                    className={`text-sm font-medium leading-tight ${
                      task.completed ? "text-green-700 line-through" : "text-gray-900"
                    }`}
                  >
                    {task.title}
                  </p>

                  {/* PHASE 5: Task Badges */}
                  <TaskBadges task={task} compact />
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
