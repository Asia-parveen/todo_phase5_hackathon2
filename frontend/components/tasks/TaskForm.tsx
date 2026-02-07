"use client";

import { useState } from "react";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
// PHASE 5 ADDITION – SAFE: Import Phase5Fields component
import Phase5Fields from "@/components/tasks/Phase5Fields";

// PHASE 5 ADDITION – SAFE: Extended interface with optional Phase 5 fields
interface Phase5Data {
  priority?: string;
  due_date?: string | null;
  tags?: string[] | null;
  recurrence_pattern?: string | null;
}

interface TaskFormProps {
  onSubmit: (title: string, description?: string, phase5Data?: Phase5Data) => Promise<void>;
  onCancel?: () => void;
  // PHASE 5 ADDITION – SAFE: Option to show/hide Phase 5 fields (default: show)
  showPhase5Fields?: boolean;
}

export default function TaskForm({ onSubmit, onCancel, showPhase5Fields = true }: TaskFormProps) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // PHASE 5 ADDITION – SAFE: State for optional Phase 5 fields
  const [priority, setPriority] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [tags, setTags] = useState("");
  const [recurrencePattern, setRecurrencePattern] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // Validate title
    if (!title.trim()) {
      setError("Title is required");
      return;
    }

    if (title.length > 200) {
      setError("Title must be 200 characters or less");
      return;
    }

    if (description && description.length > 2000) {
      setError("Description must be 2000 characters or less");
      return;
    }

    setLoading(true);
    try {
      // PHASE 5 ADDITION – SAFE: Build Phase 5 data only if fields are filled
      const phase5Data: Phase5Data = {};
      if (priority) phase5Data.priority = priority;
      if (dueDate) phase5Data.due_date = new Date(dueDate).toISOString();
      if (tags.trim()) {
        phase5Data.tags = tags.split(",").map((t) => t.trim().toLowerCase()).filter(Boolean);
      }
      if (recurrencePattern) phase5Data.recurrence_pattern = recurrencePattern;

      // Pass Phase 5 data only if any field is set
      const hasPhase5Data = Object.keys(phase5Data).length > 0;
      await onSubmit(title.trim(), description.trim() || undefined, hasPhase5Data ? phase5Data : undefined);

      // Clear form on success
      setTitle("");
      setDescription("");
      // PHASE 5 ADDITION – SAFE: Clear Phase 5 fields
      setPriority("");
      setDueDate("");
      setTags("");
      setRecurrencePattern("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create task");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-md text-red-700 text-sm">
          {error}
        </div>
      )}

      <Input
        label="Title"
        name="title"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        placeholder="What needs to be done?"
        required
        maxLength={200}
      />

      <div className="w-full">
        <label
          htmlFor="description"
          className="block text-sm font-medium text-gray-700 mb-1"
        >
          Description (optional)
        </label>
        <textarea
          id="description"
          name="description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Add more details..."
          maxLength={2000}
          rows={3}
          className="block w-full rounded-md border border-gray-300 px-3 py-2 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
        />
      </div>

      {/* PHASE 5 ADDITION – SAFE: Optional Phase 5 fields */}
      {showPhase5Fields && (
        <Phase5Fields
          priority={priority}
          onPriorityChange={setPriority}
          dueDate={dueDate}
          onDueDateChange={setDueDate}
          tags={tags}
          onTagsChange={setTags}
          recurrencePattern={recurrencePattern}
          onRecurrenceChange={setRecurrencePattern}
        />
      )}

      <div className="flex gap-2">
        <Button type="submit" loading={loading} disabled={loading}>
          Add Task
        </Button>
        {onCancel && (
          <Button
            type="button"
            variant="secondary"
            onClick={onCancel}
            disabled={loading}
          >
            Cancel
          </Button>
        )}
      </div>
    </form>
  );
}
