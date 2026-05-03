"use client";

import type { Task } from "@/types";

interface Props {
  tasks: Task[];
  onFilter: (status: "all" | "pending" | "completed" | "overdue") => void;
  activeFilter: string;
}

export function StatsBar({ tasks, onFilter, activeFilter }: Props) {
  const total = tasks.length;
  const completed = tasks.filter((t) => t.status === "completed").length;
  const pending = total - completed;
  const overdue = tasks.filter((t) => {
    if (t.status === "completed" || !t.dueDate) return false;
    return new Date(t.dueDate) < new Date();
  }).length;

  const pct = total > 0 ? Math.round((completed / total) * 100) : 0;

  const stats = [
    {
      label: "Total tasks",
      value: total,
      color: "var(--accent)",
      filter: "all",
      icon: "M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2",
    },
    {
      label: "Completed",
      value: completed,
      color: "var(--priority-low)",
      filter: "completed",
      icon: "M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z",
    },
    {
      label: "Pending",
      value: pending,
      color: "var(--priority-medium)",
      filter: "pending",
      icon: "M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z",
    },
    {
      label: "Overdue",
      value: overdue,
      color: "var(--priority-high)",
      filter: "overdue",
      icon: "M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z",
    },
  ];

  return (
    <div className="space-y-4">
      {/* Progress bar */}
      <div>
        <div
          className="flex justify-between text-xs mb-1.5"
          style={{ color: "var(--text-muted)" }}
        >
          <span>Overall progress</span>
          <span>{pct}%</span>
        </div>
        <div
          className="w-full h-1.5 rounded-full overflow-hidden"
          style={{ background: "var(--border)" }}
        >
          <div
            className="h-full rounded-full transition-all duration-500"
            style={{ width: `${pct}%`, background: "var(--priority-low)" }}
          />
        </div>
      </div>

      {/* Stat cards — each is now a clickable button */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {stats.map((s) => {
          const isActive = activeFilter === s.filter;
          return (
            <button
              key={s.label}
              onClick={() =>
                onFilter(
                  s.filter as "all" | "pending" | "completed" | "overdue",
                )
              }
              className="card p-4 text-left transition-all duration-200"
              style={{
                cursor: "pointer",
                borderColor: isActive ? s.color : undefined,
                boxShadow: isActive ? `0 0 0 1px ${s.color}` : undefined,
                background: isActive
                  ? `color-mix(in srgb, ${s.color} 8%, var(--surface))`
                  : undefined,
              }}
            >
              <div className="flex items-center gap-2 mb-2">
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke={s.color}
                  strokeWidth="2"
                >
                  <path d={s.icon} />
                </svg>
                <span
                  className="text-xs"
                  style={{ color: "var(--text-muted)" }}
                >
                  {s.label}
                </span>
              </div>
              <p
                className="font-display text-2xl font-700"
                style={{ color: s.color }}
              >
                {s.value}
              </p>
              {isActive && (
                <p className="text-xs mt-1" style={{ color: s.color }}>
                  ● Filtered
                </p>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
