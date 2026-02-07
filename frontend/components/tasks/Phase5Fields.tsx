"use client";

// PHASE 5 ADDITION – SAFE: Optional additional fields for task creation/editing

import { PRIORITY_CONFIG, RECURRENCE_CONFIG } from "@/lib/types";

interface Phase5FieldsProps {
  priority: string;
  onPriorityChange: (value: string) => void;
  dueDate: string;
  onDueDateChange: (value: string) => void;
  tags: string;
  onTagsChange: (value: string) => void;
  recurrencePattern: string;
  onRecurrenceChange: (value: string) => void;
  showLabels?: boolean;
}

export default function Phase5Fields({
  priority,
  onPriorityChange,
  dueDate,
  onDueDateChange,
  tags,
  onTagsChange,
  recurrencePattern,
  onRecurrenceChange,
  showLabels = true,
}: Phase5FieldsProps) {
  // Get minimum date (today)
  const today = new Date().toISOString().split("T")[0];

  return (
    <div className="space-y-4 pt-4 border-t border-purple-100">
      {/* Section Header */}
      <div className="flex items-center gap-2">
        <span className="text-sm font-semibold text-purple-600">
          Additional Options
        </span>
        <span className="text-xs text-gray-400">(optional)</span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Priority Dropdown */}
        <div>
          {showLabels && (
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Priority
            </label>
          )}
          <select
            value={priority}
            onChange={(e) => onPriorityChange(e.target.value)}
            className="block w-full rounded-xl border-2 border-purple-200 px-4 py-3 text-gray-900 focus:outline-none focus:ring-2 focus:ring-purple-200 focus:border-purple-500 transition-all duration-300 bg-white/50 hover:border-purple-300"
          >
            <option value="">Default (Medium)</option>
            {Object.entries(PRIORITY_CONFIG).map(([key, { label }]) => (
              <option key={key} value={key}>
                {label}
              </option>
            ))}
          </select>
        </div>

        {/* Due Date Picker */}
        <div>
          {showLabels && (
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Due Date
            </label>
          )}
          <input
            type="date"
            value={dueDate}
            onChange={(e) => onDueDateChange(e.target.value)}
            min={today}
            className="block w-full rounded-xl border-2 border-purple-200 px-4 py-3 text-gray-900 focus:outline-none focus:ring-2 focus:ring-purple-200 focus:border-purple-500 transition-all duration-300 bg-white/50 hover:border-purple-300"
          />
        </div>

        {/* Tags Input */}
        <div>
          {showLabels && (
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Tags
              <span className="text-xs text-gray-400 ml-1">(comma separated)</span>
            </label>
          )}
          <input
            type="text"
            value={tags}
            onChange={(e) => onTagsChange(e.target.value)}
            placeholder="work, urgent, meeting"
            className="block w-full rounded-xl border-2 border-purple-200 px-4 py-3 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-200 focus:border-purple-500 transition-all duration-300 bg-white/50 hover:border-purple-300"
          />
        </div>

        {/* Recurrence Pattern */}
        <div>
          {showLabels && (
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Repeat
            </label>
          )}
          <select
            value={recurrencePattern}
            onChange={(e) => onRecurrenceChange(e.target.value)}
            className="block w-full rounded-xl border-2 border-purple-200 px-4 py-3 text-gray-900 focus:outline-none focus:ring-2 focus:ring-purple-200 focus:border-purple-500 transition-all duration-300 bg-white/50 hover:border-purple-300"
          >
            <option value="">No repeat</option>
            {Object.entries(RECURRENCE_CONFIG).map(([key, { label, icon }]) => (
              <option key={key} value={key}>
                {icon} {label}
              </option>
            ))}
          </select>
        </div>
      </div>
    </div>
  );
}
