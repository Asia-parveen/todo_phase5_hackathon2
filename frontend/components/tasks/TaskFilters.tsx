"use client";

// PHASE 5 ADDITION – SAFE: New reusable filter/search/sort component

import { useState, useEffect, useCallback } from "react";
import { TaskFilterParams, PRIORITY_CONFIG } from "@/lib/types";
import Button from "@/components/ui/Button";

interface TaskFiltersProps {
  onFilterChange: (filters: TaskFilterParams, searchQuery?: string) => void;
  initialFilters?: TaskFilterParams;
  availableTags?: string[];
}

export default function TaskFilters({
  onFilterChange,
  initialFilters = {},
  availableTags = [],
}: TaskFiltersProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [filters, setFilters] = useState<TaskFilterParams>({
    status: initialFilters.status,
    priority: initialFilters.priority,
    tags: initialFilters.tags || [],
    has_due_date: initialFilters.has_due_date,
    sort_by: initialFilters.sort_by || "created_at",
    order: initialFilters.order || "desc",
  });
  const [tagInput, setTagInput] = useState("");

  // Debounced filter application
  useEffect(() => {
    const timer = setTimeout(() => {
      onFilterChange(filters, searchQuery || undefined);
    }, 300);
    return () => clearTimeout(timer);
  }, [filters, searchQuery, onFilterChange]);

  const handleFilterChange = useCallback(
    (key: keyof TaskFilterParams, value: TaskFilterParams[keyof TaskFilterParams]) => {
      setFilters((prev) => ({ ...prev, [key]: value }));
    },
    []
  );

  const handleTagAdd = () => {
    const trimmedTag = tagInput.trim().toLowerCase();
    if (trimmedTag && !filters.tags?.includes(trimmedTag)) {
      handleFilterChange("tags", [...(filters.tags || []), trimmedTag]);
      setTagInput("");
    }
  };

  const handleTagRemove = (tagToRemove: string) => {
    handleFilterChange(
      "tags",
      filters.tags?.filter((t) => t !== tagToRemove) || []
    );
  };

  const handleClearFilters = () => {
    setSearchQuery("");
    setFilters({
      status: undefined,
      priority: undefined,
      tags: [],
      has_due_date: undefined,
      sort_by: "created_at",
      order: "desc",
    });
  };

  const hasActiveFilters =
    searchQuery ||
    filters.status ||
    filters.priority ||
    (filters.tags && filters.tags.length > 0) ||
    filters.has_due_date !== undefined;

  return (
    <div className="bg-white/80 backdrop-blur-sm border border-purple-100 rounded-2xl shadow-lg shadow-purple-100/50 overflow-hidden transition-all duration-300">
      {/* Search Bar - Always Visible */}
      <div className="p-4">
        <div className="flex gap-3">
          {/* Search Input */}
          <div className="flex-1 relative">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
              <svg
                className="h-5 w-5 text-purple-400"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
            </div>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search tasks by title or description..."
              className="block w-full pl-12 pr-4 py-3 rounded-xl border-2 border-purple-200 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-200 focus:border-purple-500 transition-all duration-300 bg-white/50 hover:border-purple-300"
            />
          </div>

          {/* Toggle Filters Button */}
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className={`px-4 py-3 rounded-xl border-2 transition-all duration-300 flex items-center gap-2 ${
              isExpanded || hasActiveFilters
                ? "border-purple-500 bg-purple-50 text-purple-700"
                : "border-purple-200 bg-white text-gray-600 hover:border-purple-300 hover:bg-purple-50"
            }`}
          >
            <svg
              className="h-5 w-5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z"
              />
            </svg>
            <span className="font-medium">Filters</span>
            {hasActiveFilters && (
              <span className="w-2 h-2 rounded-full bg-purple-500"></span>
            )}
          </button>
        </div>
      </div>

      {/* Expanded Filters Panel */}
      {isExpanded && (
        <div className="px-4 pb-4 pt-2 border-t border-purple-100 animate-slide-in">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Status Filter */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Status
              </label>
              <select
                value={filters.status || ""}
                onChange={(e) =>
                  handleFilterChange(
                    "status",
                    e.target.value ? (e.target.value as "pending" | "completed") : undefined
                  )
                }
                className="block w-full px-4 py-2.5 rounded-xl border-2 border-purple-200 text-gray-900 focus:outline-none focus:ring-2 focus:ring-purple-200 focus:border-purple-500 transition-all duration-300 bg-white hover:border-purple-300"
              >
                <option value="">All Tasks</option>
                <option value="pending">Pending</option>
                <option value="completed">Completed</option>
              </select>
            </div>

            {/* Priority Filter */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Priority
              </label>
              <select
                value={filters.priority || ""}
                onChange={(e) =>
                  handleFilterChange(
                    "priority",
                    e.target.value
                      ? (e.target.value as "low" | "medium" | "high" | "critical")
                      : undefined
                  )
                }
                className="block w-full px-4 py-2.5 rounded-xl border-2 border-purple-200 text-gray-900 focus:outline-none focus:ring-2 focus:ring-purple-200 focus:border-purple-500 transition-all duration-300 bg-white hover:border-purple-300"
              >
                <option value="">All Priorities</option>
                {Object.entries(PRIORITY_CONFIG).map(([key, { label }]) => (
                  <option key={key} value={key}>
                    {label}
                  </option>
                ))}
              </select>
            </div>

            {/* Has Due Date Filter */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Due Date
              </label>
              <select
                value={
                  filters.has_due_date === undefined
                    ? ""
                    : filters.has_due_date
                    ? "true"
                    : "false"
                }
                onChange={(e) =>
                  handleFilterChange(
                    "has_due_date",
                    e.target.value === ""
                      ? undefined
                      : e.target.value === "true"
                  )
                }
                className="block w-full px-4 py-2.5 rounded-xl border-2 border-purple-200 text-gray-900 focus:outline-none focus:ring-2 focus:ring-purple-200 focus:border-purple-500 transition-all duration-300 bg-white hover:border-purple-300"
              >
                <option value="">All Tasks</option>
                <option value="true">Has Due Date</option>
                <option value="false">No Due Date</option>
              </select>
            </div>

            {/* Sort By */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Sort By
              </label>
              <div className="flex gap-2">
                <select
                  value={filters.sort_by || "created_at"}
                  onChange={(e) =>
                    handleFilterChange(
                      "sort_by",
                      e.target.value as "created_at" | "due_date" | "priority" | "title"
                    )
                  }
                  className="block flex-1 px-4 py-2.5 rounded-xl border-2 border-purple-200 text-gray-900 focus:outline-none focus:ring-2 focus:ring-purple-200 focus:border-purple-500 transition-all duration-300 bg-white hover:border-purple-300"
                >
                  <option value="created_at">Created</option>
                  <option value="due_date">Due Date</option>
                  <option value="priority">Priority</option>
                  <option value="title">Title</option>
                </select>
                <button
                  onClick={() =>
                    handleFilterChange(
                      "order",
                      filters.order === "asc" ? "desc" : "asc"
                    )
                  }
                  className="px-3 py-2.5 rounded-xl border-2 border-purple-200 text-gray-600 hover:border-purple-300 hover:bg-purple-50 transition-all duration-300"
                  title={filters.order === "asc" ? "Ascending" : "Descending"}
                >
                  {filters.order === "asc" ? (
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
                    </svg>
                  ) : (
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  )}
                </button>
              </div>
            </div>
          </div>

          {/* Tags Filter */}
          <div className="mt-4">
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Filter by Tags
            </label>
            <div className="flex flex-wrap gap-2 mb-2">
              {filters.tags?.map((tag) => (
                <span
                  key={tag}
                  className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm bg-purple-100 text-purple-700 border border-purple-200"
                >
                  #{tag}
                  <button
                    onClick={() => handleTagRemove(tag)}
                    className="hover:text-purple-900 transition-colors"
                  >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </span>
              ))}
            </div>
            <div className="flex gap-2">
              <input
                type="text"
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), handleTagAdd())}
                placeholder="Type a tag and press Enter..."
                className="flex-1 px-4 py-2.5 rounded-xl border-2 border-purple-200 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-200 focus:border-purple-500 transition-all duration-300 bg-white hover:border-purple-300"
              />
              <Button size="sm" variant="secondary" onClick={handleTagAdd}>
                Add Tag
              </Button>
            </div>
            {/* Quick Tag Suggestions */}
            {availableTags.length > 0 && (
              <div className="mt-2 flex flex-wrap gap-1">
                <span className="text-xs text-gray-500 mr-1">Quick add:</span>
                {availableTags
                  .filter((t) => !filters.tags?.includes(t))
                  .slice(0, 5)
                  .map((tag) => (
                    <button
                      key={tag}
                      onClick={() => handleFilterChange("tags", [...(filters.tags || []), tag])}
                      className="text-xs px-2 py-1 rounded-full bg-gray-100 text-gray-600 hover:bg-purple-100 hover:text-purple-700 transition-colors"
                    >
                      #{tag}
                    </button>
                  ))}
              </div>
            )}
          </div>

          {/* Clear Filters Button */}
          {hasActiveFilters && (
            <div className="mt-4 pt-4 border-t border-purple-100">
              <button
                onClick={handleClearFilters}
                className="text-sm text-purple-600 hover:text-purple-800 font-medium transition-colors flex items-center gap-2"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
                Clear all filters
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
