"use client";
/**
 * app/dashboard/page.tsx
 * Main dashboard: task list, filters, CRUD operations.
 * All data fetching is done client-side with the REST API.
 */

import { useState, useEffect, useCallback, useMemo } from "react";
import { useAuth } from "@/components/AuthProvider";
import { Navbar } from "@/components/layout/Navbar";
import { StatsBar } from "@/components/tasks/StatsBar";
import { TaskCard } from "@/components/tasks/TaskCard";
import { TaskModal } from "@/components/tasks/TaskModal";
import { Filters } from "@/components/tasks/Filters";
import type { Task, User, CreateTaskPayload, TaskFilters } from "@/types";

// ─── Component ────────────────────────────────────────────────────────────────

export default function DashboardPage() {
  const { user } = useAuth();

  // ── State ──────────────────────────────────────────────────────────────────
  const [tasks, setTasks] = useState<Task[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [activeStatFilter, setActiveStatFilter] = useState<
    "all" | "pending" | "completed" | "overdue"
  >("all");
  const [filters, setFilters] = useState<TaskFilters>({
    status: "all",
    priority: "all",
    assignedTo: "all",
  });

  // ── Data fetching ──────────────────────────────────────────────────────────

  const fetchTasks = useCallback(async () => {
    const res = await fetch("/api/tasks");
    const json = await res.json();
    if (json.success) setTasks(json.data);
  }, []);

  const fetchUsers = useCallback(async () => {
    const res = await fetch("/api/users");
    const json = await res.json();
    if (json.success) setUsers(json.data);
  }, []);

  useEffect(() => {
    Promise.all([fetchTasks(), fetchUsers()]).finally(() => setLoading(false));
  }, [fetchTasks, fetchUsers]);

  // ── Client-side filtering ──────────────────────────────────────────────────

  const filteredTasks = useMemo(() => {
    return tasks.filter((t) => {
      // Stat card filter takes priority over dropdown filters
      if (activeStatFilter === "completed") return t.status === "completed";
      if (activeStatFilter === "pending") return t.status === "pending";
      if (activeStatFilter === "overdue")
        return (
          t.status !== "completed" &&
          !!t.dueDate &&
          new Date(t.dueDate) < new Date()
        );

      // Dropdown filters (only when no stat card active)
      if (filters.status !== "all" && t.status !== filters.status) return false;
      if (filters.priority !== "all" && t.priority !== filters.priority)
        return false;
      if (filters.assignedTo !== "all") {
        const aid =
          typeof t.assignedTo === "object" ? t.assignedTo?._id : t.assignedTo;
        if (aid !== filters.assignedTo) return false;
      }
      return true;
    });
  }, [tasks, filters, activeStatFilter]);

  // ── Stat card click handler ────────────────────────────────────────────────

  const handleStatFilter = (f: "all" | "pending" | "completed" | "overdue") => {
    setActiveStatFilter(f);
    // Reset dropdown filters when a stat card is clicked
    setFilters({ status: "all", priority: "all", assignedTo: "all" });
  };

  // ── CRUD handlers ──────────────────────────────────────────────────────────

  /** Create a new task */
  const handleCreate = async (payload: CreateTaskPayload) => {
    const res = await fetch("/api/tasks", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    const json = await res.json();
    if (json.success) setTasks((prev) => [json.data, ...prev]);
  };

  /** Update an existing task */
  const handleUpdate = async (payload: CreateTaskPayload) => {
    if (!editingTask) return;
    const res = await fetch(`/api/tasks/${editingTask._id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    const json = await res.json();
    if (json.success) {
      setTasks((prev) =>
        prev.map((t) => (t._id === editingTask._id ? json.data : t)),
      );
    }
    setEditingTask(null);
  };

  /** Toggle a task's status between pending and completed */
  const handleToggle = async (id: string, status: "pending" | "completed") => {
    const res = await fetch(`/api/tasks/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });
    const json = await res.json();
    if (json.success) {
      setTasks((prev) => prev.map((t) => (t._id === id ? json.data : t)));
    }
  };

  /** Delete a task */
  const handleDelete = async (id: string) => {
    const res = await fetch(`/api/tasks/${id}`, { method: "DELETE" });
    if (res.ok) setTasks((prev) => prev.filter((t) => t._id !== id));
  };

  /** Open edit modal */
  const handleEdit = (task: Task) => {
    setEditingTask(task);
    setShowModal(true);
  };

  // ── Modal save dispatcher ──────────────────────────────────────────────────

  const handleSave = async (payload: CreateTaskPayload) => {
    if (editingTask) {
      await handleUpdate(payload);
    } else {
      await handleCreate(payload);
    }
  };

  const closeModal = () => {
    setShowModal(false);
    setEditingTask(null);
  };

  // ── Filter label for task count line ──────────────────────────────────────

  const filterLabel: Record<string, string> = {
    all: "",
    pending: " pending",
    completed: " completed",
    overdue: " overdue",
  };

  // ── Render ─────────────────────────────────────────────────────────────────

  return (
    <div className="min-h-screen" style={{ background: "var(--bg)" }}>
      <Navbar />

      <main className="max-w-4xl mx-auto px-4 sm:px-6 py-8">
        {/* Page header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1
              className="font-display text-2xl sm:text-3xl font-700"
              style={{ color: "var(--text)" }}
            >
              Dashboard
            </h1>
            <p
              className="text-sm mt-0.5"
              style={{ color: "var(--text-muted)" }}
            >
              {user
                ? `Welcome back, ${user.name.split(" ")[0]}`
                : "Manage your tasks"}
            </p>
          </div>

          <button
            className="btn btn-primary"
            onClick={() => {
              setEditingTask(null);
              setShowModal(true);
            }}
          >
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
            >
              <line x1="12" y1="5" x2="12" y2="19" />
              <line x1="5" y1="12" x2="19" y2="12" />
            </svg>
            New task
          </button>
        </div>

        {/* Stats — clicking a card filters the list below */}
        <div className="mb-6">
          <StatsBar
            tasks={tasks}
            onFilter={handleStatFilter}
            activeFilter={activeStatFilter}
          />
        </div>

        {/* Dropdown filters — only shown when no stat card is active */}
        {activeStatFilter === "all" && (
          <div className="mb-4">
            <Filters filters={filters} users={users} onChange={setFilters} />
          </div>
        )}

        {/* Active stat filter pill + clear button */}
        {activeStatFilter !== "all" && (
          <div className="flex items-center gap-2 mb-4">
            <span
              className="text-xs px-3 py-1 rounded-full font-500"
              style={{
                background: "var(--surface-2)",
                border: "1px solid var(--border)",
                color: "var(--text-muted)",
              }}
            >
              Showing:{" "}
              <span style={{ color: "var(--text)" }}>{activeStatFilter}</span>{" "}
              tasks
            </span>
            <button
              className="text-xs flex items-center gap-1 px-2 py-1 rounded transition-colors"
              style={{
                color: "var(--text-muted)",
                background: "var(--surface-2)",
                border: "1px solid var(--border)",
              }}
              onClick={() => setActiveStatFilter("all")}
            >
              <svg
                width="11"
                height="11"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </svg>
              Clear
            </button>
          </div>
        )}

        {/* Task count */}
        <p className="text-xs mb-3" style={{ color: "var(--text-muted)" }}>
          {filteredTasks.length}
          {filterLabel[activeStatFilter]}{" "}
          {filteredTasks.length === 1 ? "task" : "tasks"}
          {activeStatFilter === "all" &&
          (filters.status !== "all" ||
            filters.priority !== "all" ||
            filters.assignedTo !== "all")
            ? " (filtered)"
            : ""}
        </p>

        {/* Task list */}
        {loading ? (
          <div className="flex flex-col gap-3">
            {[...Array(3)].map((_, i) => (
              <div
                key={i}
                className="card p-4 animate-pulse"
                style={{ height: 90 }}
              >
                <div
                  className="h-3 rounded"
                  style={{ width: "60%", background: "var(--surface-2)" }}
                />
                <div
                  className="h-2 rounded mt-3"
                  style={{ width: "40%", background: "var(--surface-2)" }}
                />
              </div>
            ))}
          </div>
        ) : filteredTasks.length === 0 ? (
          <div className="card p-12 text-center animate-fade-in">
            <svg
              className="mx-auto mb-4"
              width="40"
              height="40"
              viewBox="0 0 24 24"
              fill="none"
              stroke="var(--border)"
              strokeWidth="1.5"
            >
              <path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2" />
              <rect x="9" y="3" width="6" height="4" rx="1" />
            </svg>
            <p className="font-500" style={{ color: "var(--text-muted)" }}>
              {tasks.length === 0
                ? "No tasks yet. Create your first one!"
                : `No ${activeStatFilter === "all" ? "" : activeStatFilter + " "}tasks found.`}
            </p>
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            {filteredTasks.map((task) => (
              <TaskCard
                key={task._id}
                task={task}
                currentUserId={user?._id ?? ""}
                onToggle={handleToggle}
                onEdit={handleEdit}
                onDelete={handleDelete}
              />
            ))}
          </div>
        )}
      </main>

      {/* Create / Edit modal */}
      {showModal && (
        <TaskModal
          task={editingTask}
          users={users}
          onSave={handleSave}
          onClose={closeModal}
        />
      )}
    </div>
  );
}
