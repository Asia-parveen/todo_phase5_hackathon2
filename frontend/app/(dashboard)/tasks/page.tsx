"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Task, TaskCreate, TaskUpdate, TaskFilterParams } from "@/lib/types";
import { api, ApiRequestError, getAuthToken } from "@/lib/api";
import { Card, CardBody, CardHeader } from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import Loading from "@/components/ui/Loading";
import TaskForm from "@/components/tasks/TaskForm";
// PHASE 5 ADDITION – SAFE: Import new components
import TaskFilters from "@/components/tasks/TaskFilters";
import TaskBadges from "@/components/tasks/TaskBadges";

export default function TasksPage() {
  const router = useRouter();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [editTitle, setEditTitle] = useState("");
  const [editDescription, setEditDescription] = useState("");
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  // PHASE 5 ADDITION – SAFE: State for filters and search
  const [activeFilters, setActiveFilters] = useState<TaskFilterParams>({});
  const [searchQuery, setSearchQuery] = useState<string | undefined>();
  // PHASE 5 ADDITION – SAFE: Edit mode Phase 5 fields
  const [editPriority, setEditPriority] = useState("");
  const [editDueDate, setEditDueDate] = useState("");
  const [editTags, setEditTags] = useState("");
  const [editRecurrence, setEditRecurrence] = useState("");

  // PHASE 5 ADDITION – SAFE: Enhanced fetch with filter/search support
  const fetchTasks = useCallback(async (filters?: TaskFilterParams, query?: string) => {
    const token = getAuthToken();
    if (!token) {
      router.replace("/login");
      return;
    }

    try {
      setLoading(true);
      setError(null);

      // PHASE 5 ADDITION – SAFE: Build query string for filters
      const params = new URLSearchParams();

      // If search query exists, use search endpoint
      if (query && query.trim()) {
        params.append("query", query.trim());
      }

      // Add filter parameters
      if (filters?.status) params.append("status", filters.status);
      if (filters?.priority) params.append("priority", filters.priority);
      if (filters?.tags && filters.tags.length > 0) {
        filters.tags.forEach(tag => params.append("tags", tag));
      }
      if (filters?.has_due_date !== undefined) {
        params.append("has_due_date", String(filters.has_due_date));
      }
      if (filters?.sort_by) params.append("sort_by", filters.sort_by);
      if (filters?.order) params.append("order", filters.order);

      const queryString = params.toString();

      // Use search endpoint if query exists, otherwise use tasks endpoint
      const endpoint = query && query.trim()
        ? `/api/search/search${queryString ? `?${queryString}` : ""}`
        : `/api/tasks${queryString ? `?${queryString}` : ""}`;

      const data = await api.get<Task[]>(endpoint);
      setTasks(data);
    } catch (err) {
      if (err instanceof ApiRequestError) {
        if (err.status === 401) {
          router.replace("/login");
          return;
        }
        setError(err.error.message || "Failed to load tasks");
      } else {
        setError("Failed to load tasks");
      }
    } finally {
      setLoading(false);
    }
  }, [router]);

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchTasks(activeFilters, searchQuery);
    }, 100);
    return () => clearTimeout(timer);
  }, [fetchTasks, activeFilters, searchQuery]);

  // PHASE 5 ADDITION – SAFE: Handler for filter changes
  const handleFilterChange = useCallback((filters: TaskFilterParams, query?: string) => {
    setActiveFilters(filters);
    setSearchQuery(query);
  }, []);

  // PHASE 5 ADDITION – SAFE: Extended to accept Phase 5 fields
  interface Phase5Data {
    priority?: string;
    due_date?: string | null;
    tags?: string[] | null;
    recurrence_pattern?: string | null;
  }

  const handleCreateTask = async (title: string, description?: string, phase5Data?: Phase5Data) => {
    const taskData: TaskCreate = {
      title,
      description,
      // PHASE 5 ADDITION – SAFE: Spread Phase 5 data if provided
      ...(phase5Data && {
        priority: phase5Data.priority as TaskCreate["priority"],
        due_date: phase5Data.due_date,
        tags: phase5Data.tags,
        recurrence_pattern: phase5Data.recurrence_pattern as TaskCreate["recurrence_pattern"],
      }),
    };
    const newTask = await api.post<Task>("/api/tasks", taskData);
    setTasks([newTask, ...tasks]);
    setShowForm(false);
  };

  const handleToggleComplete = async (task: Task) => {
    try {
      const updatedTask = await api.patch<Task>(`/api/tasks/${task.id}/complete`);

      // Show success message
      setSuccessMessage(`"${task.title}" marked as complete!`);
      setTimeout(() => setSuccessMessage(null), 3000);

      setTasks(tasks.map((t) => (t.id === task.id ? updatedTask : t)));
    } catch (err) {
      console.error("Failed to toggle task:", err);
    }
  };

  const handleDeleteTask = async (taskId: number) => {
    if (!confirm("Are you sure you want to delete this task?")) {
      return;
    }
    try {
      await api.delete(`/api/tasks/${taskId}`);
      setTasks(tasks.filter((t) => t.id !== taskId));
    } catch (err) {
      console.error("Failed to delete task:", err);
    }
  };

  const startEditing = (task: Task) => {
    setEditingTask(task);
    setEditTitle(task.title);
    setEditDescription(task.description || "");
    // PHASE 5 ADDITION – SAFE: Initialize Phase 5 fields for editing
    setEditPriority(task.priority || "");
    setEditDueDate(task.due_date ? task.due_date.split("T")[0] : "");
    setEditTags(task.tags ? task.tags.join(", ") : "");
    setEditRecurrence(task.recurrence_pattern || "");
  };

  const cancelEditing = () => {
    setEditingTask(null);
    setEditTitle("");
    setEditDescription("");
    // PHASE 5 ADDITION – SAFE: Clear Phase 5 edit fields
    setEditPriority("");
    setEditDueDate("");
    setEditTags("");
    setEditRecurrence("");
  };

  const handleUpdateTask = async () => {
    if (!editingTask) return;

    if (!editTitle.trim()) {
      alert("Title is required");
      return;
    }

    try {
      const updateData: TaskUpdate = {
        title: editTitle.trim(),
        description: editDescription.trim() || null,
        // PHASE 5 ADDITION – SAFE: Include Phase 5 fields in update
        priority: editPriority ? (editPriority as TaskUpdate["priority"]) : undefined,
        due_date: editDueDate ? new Date(editDueDate).toISOString() : null,
        tags: editTags.trim()
          ? editTags.split(",").map((t) => t.trim().toLowerCase()).filter(Boolean)
          : null,
        recurrence_pattern: editRecurrence
          ? (editRecurrence as TaskUpdate["recurrence_pattern"])
          : null,
      };
      const updatedTask = await api.put<Task>(
        `/api/tasks/${editingTask.id}`,
        updateData
      );
      setTasks(tasks.map((t) => (t.id === editingTask.id ? updatedTask : t)));
      cancelEditing();

      // Show success message
      setSuccessMessage(`Task updated successfully!`);
      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (err) {
      console.error("Failed to update task:", err);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <Loading size="lg" text="Loading tasks..." />
      </div>
    );
  }

  if (error) {
    return (
      <Card>
        <CardBody>
          <div className="text-center py-8">
            <p className="text-red-600 mb-4">{error}</p>
            <button
              onClick={() => fetchTasks(activeFilters, searchQuery)}
              className="btn-glow text-purple-600 hover:text-pink-600 font-medium transition-colors"
            >
              Try again
            </button>
          </div>
        </CardBody>
      </Card>
    );
  }

  const completedCount = tasks.filter((t) => t.completed).length;
  const totalCount = tasks.length;
  const completionPercentage = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

  return (
    <div className="space-y-6">
      {/* Success notification */}
      {successMessage && (
        <div className="animate-slide-in bg-gradient-to-r from-green-500 to-emerald-500 text-white px-6 py-4 rounded-2xl shadow-lg flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <span className="font-semibold">{successMessage}</span>
          </div>
          <button
            onClick={() => setSuccessMessage(null)}
            className="hover:bg-white/20 p-2 rounded-full transition-colors"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      )}

      {/* Header */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
          <div>
            <h2 className="text-3xl font-bold gradient-text">
              My Tasks
            </h2>
            {totalCount > 0 && (
              <div className="flex items-center gap-3 mt-2">
                <div className="flex-1 max-w-[200px] h-2 bg-gray-200 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-green-500 to-emerald-500 rounded-full transition-all duration-500"
                    style={{ width: `${completionPercentage}%` }}
                  />
                </div>
                <p className="text-sm text-gray-500 font-medium">
                  {completedCount} of {totalCount} completed ({completionPercentage}%)
                </p>
              </div>
            )}
          </div>
          {!showForm && (
            <Button onClick={() => setShowForm(true)} className="btn-glow">
              <svg className="w-5 h-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Add Task
            </Button>
          )}
        </div>
      </div>

      {/* PHASE 5 ADDITION – SAFE: Filter/Search Panel */}
      <TaskFilters
        onFilterChange={handleFilterChange}
        initialFilters={activeFilters}
        availableTags={Array.from(new Set(tasks.flatMap((t) => t.tags || [])))}
      />

      {/* Create Task Form */}
      {showForm && (
        <Card className="animate-slide-in">
          <CardHeader>
            <h3 className="text-lg font-semibold gradient-text">
              New Task
            </h3>
          </CardHeader>
          <CardBody>
            <TaskForm
              onSubmit={handleCreateTask}
              onCancel={() => setShowForm(false)}
            />
          </CardBody>
        </Card>
      )}

      {/* Empty State */}
      {tasks.length === 0 && !showForm ? (
        <Card>
          <CardBody>
            <div className="text-center py-16">
              <div className="w-24 h-24 mx-auto rounded-3xl bg-gradient-to-br from-purple-100 via-pink-100 to-indigo-100 flex items-center justify-center mb-6 shadow-lg">
                <svg
                  className="h-12 w-12 text-purple-500"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.5}
                    d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                  />
                </svg>
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-3">
                No tasks yet
              </h3>
              <p className="text-gray-500 mb-8 max-w-md mx-auto text-base">
                Start organizing your day by creating your first task. Stay productive! 🚀
              </p>
              <Button onClick={() => setShowForm(true)} className="btn-glow">
                <svg className="w-5 h-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                Create Your First Task
              </Button>
            </div>
          </CardBody>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-1 lg:grid-cols-1 xl:grid-cols-1">
          {tasks.map((task, index) => (
            <Card
              key={task.id}
              className={`card-hover animate-slide-in ${
                task.completed ? "task-completed" : "task-pending"
              }`}
              style={{ animationDelay: `${index * 50}ms` }}
            >
              <CardBody>
                {editingTask?.id === task.id ? (
                  /* Edit Mode */
                  <div className="space-y-4">
                    <Input
                      label="Title"
                      value={editTitle}
                      onChange={(e) => setEditTitle(e.target.value)}
                      placeholder="Task title"
                      maxLength={200}
                    />
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Description
                      </label>
                      <textarea
                        value={editDescription}
                        onChange={(e) => setEditDescription(e.target.value)}
                        placeholder="Task description (optional)"
                        maxLength={2000}
                        rows={2}
                        className="block w-full rounded-xl border-2 border-purple-200 px-4 py-3 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-200 focus:border-purple-500 sm:text-sm transition-all duration-300 bg-white/50 hover:border-purple-300"
                      />
                    </div>
                    {/* PHASE 5 ADDITION – SAFE: Edit Phase 5 fields */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-3 border-t border-purple-100">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Priority</label>
                        <select
                          value={editPriority}
                          onChange={(e) => setEditPriority(e.target.value)}
                          className="block w-full rounded-xl border-2 border-purple-200 px-3 py-2 text-gray-900 focus:outline-none focus:ring-2 focus:ring-purple-200 focus:border-purple-500 transition-all duration-300 bg-white/50 hover:border-purple-300 text-sm"
                        >
                          <option value="">Default (Medium)</option>
                          <option value="low">Low</option>
                          <option value="medium">Medium</option>
                          <option value="high">High</option>
                          <option value="critical">Critical</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Due Date</label>
                        <input
                          type="date"
                          value={editDueDate}
                          onChange={(e) => setEditDueDate(e.target.value)}
                          className="block w-full rounded-xl border-2 border-purple-200 px-3 py-2 text-gray-900 focus:outline-none focus:ring-2 focus:ring-purple-200 focus:border-purple-500 transition-all duration-300 bg-white/50 hover:border-purple-300 text-sm"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Tags (comma separated)</label>
                        <input
                          type="text"
                          value={editTags}
                          onChange={(e) => setEditTags(e.target.value)}
                          placeholder="work, urgent"
                          className="block w-full rounded-xl border-2 border-purple-200 px-3 py-2 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-200 focus:border-purple-500 transition-all duration-300 bg-white/50 hover:border-purple-300 text-sm"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Repeat</label>
                        <select
                          value={editRecurrence}
                          onChange={(e) => setEditRecurrence(e.target.value)}
                          className="block w-full rounded-xl border-2 border-purple-200 px-3 py-2 text-gray-900 focus:outline-none focus:ring-2 focus:ring-purple-200 focus:border-purple-500 transition-all duration-300 bg-white/50 hover:border-purple-300 text-sm"
                        >
                          <option value="">No repeat</option>
                          <option value="daily">Daily</option>
                          <option value="weekly">Weekly</option>
                          <option value="monthly">Monthly</option>
                        </select>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button size="sm" onClick={handleUpdateTask} className="btn-glow">
                        Save Changes
                      </Button>
                      <Button
                        size="sm"
                        variant="secondary"
                        onClick={cancelEditing}
                      >
                        Cancel
                      </Button>
                    </div>
                  </div>
                ) : (
                  /* View Mode */
                  <div className="flex items-start gap-4">
                    <div className="relative">
                      <input
                        type="checkbox"
                        checked={task.completed}
                        onChange={() => handleToggleComplete(task)}
                        className="peer sr-only"
                        id={`task-${task.id}`}
                      />
                      <label
                        htmlFor={`task-${task.id}`}
                        className={`flex h-7 w-7 cursor-pointer items-center justify-center rounded-xl border-2 transition-all duration-300 ${
                          task.completed
                            ? "bg-gradient-to-br from-green-500 to-emerald-500 border-transparent shadow-lg shadow-green-500/30"
                            : "border-purple-300 hover:border-purple-500 hover:bg-purple-50 hover:shadow-md hover:shadow-purple-500/20"
                        }`}
                      >
                        {task.completed && (
                          <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                          </svg>
                        )}
                      </label>
                    </div>

                    {/* Task Content */}
                    <div className="flex-1 min-w-0">
                      <p
                        className={`font-semibold text-lg transition-all duration-300 ${
                          task.completed
                            ? "text-green-700 line-through"
                            : "text-gray-900"
                        }`}
                      >
                        {task.title}
                      </p>
                      {task.description && (
                        <p className={`text-base mt-2 transition-all duration-300 ${
                          task.completed ? "text-green-600/60" : "text-gray-500"
                        }`}>
                          {task.description}
                        </p>
                      )}

                      {/* PHASE 5 ADDITION – SAFE: Display priority, due date, tags, recurrence badges */}
                      <TaskBadges task={task} />

                      {/* Task ID Badge */}
                      <div className="mt-3">
                        <span className="badge-completed text-xs">
                          Task #{task.id}
                        </span>
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex gap-1">
                      <button
                        onClick={() => startEditing(task)}
                        className="btn-glow p-2.5 rounded-xl text-gray-400 hover:text-purple-600 hover:bg-purple-50 transition-all duration-300"
                        title="Edit task"
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
                            strokeWidth={1.5}
                            d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                          />
                        </svg>
                      </button>
                      <button
                        onClick={() => handleDeleteTask(task.id)}
                        className="btn-glow p-2.5 rounded-xl text-gray-400 hover:text-red-600 hover:bg-red-50 transition-all duration-300"
                        title="Delete task"
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
                            strokeWidth={1.5}
                            d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                          />
                        </svg>
                      </button>
                    </div>
                  </div>
                )}
              </CardBody>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
