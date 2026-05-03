'use client'
/**
 * components/tasks/Filters.tsx
 * Filter bar for status, priority, and assignee.
 */

import type { TaskFilters, User } from '@/types'

interface Props {
  filters:  TaskFilters
  users:    User[]
  onChange: (f: TaskFilters) => void
}

export function Filters({ filters, users, onChange }: Props) {
  const update = (patch: Partial<TaskFilters>) => onChange({ ...filters, ...patch })

  return (
    <div className="flex flex-wrap gap-2 items-center">
      {/* Status filter */}
      <select
        className="input"
        style={{ width: 'auto', padding: '0.4rem 2rem 0.4rem 0.75rem', fontSize: '0.8rem' }}
        value={filters.status}
        onChange={e => update({ status: e.target.value as TaskFilters['status'] })}
      >
        <option value="all">All status</option>
        <option value="pending">Pending</option>
        <option value="completed">Completed</option>
      </select>

      {/* Priority filter */}
      <select
        className="input"
        style={{ width: 'auto', padding: '0.4rem 2rem 0.4rem 0.75rem', fontSize: '0.8rem' }}
        value={filters.priority}
        onChange={e => update({ priority: e.target.value as TaskFilters['priority'] })}
      >
        <option value="all">All priorities</option>
        <option value="high">High</option>
        <option value="medium">Medium</option>
        <option value="low">Low</option>
      </select>

      {/* Assignee filter */}
      {users.length > 0 && (
        <select
          className="input"
          style={{ width: 'auto', padding: '0.4rem 2rem 0.4rem 0.75rem', fontSize: '0.8rem' }}
          value={filters.assignedTo}
          onChange={e => update({ assignedTo: e.target.value })}
        >
          <option value="all">All members</option>
          {users.map(u => (
            <option key={u._id} value={u._id}>{u.name}</option>
          ))}
        </select>
      )}

      {/* Clear button */}
      {(filters.status !== 'all' || filters.priority !== 'all' || filters.assignedTo !== 'all') && (
        <button
          className="text-xs flex items-center gap-1 px-2 py-1 rounded transition-colors"
          style={{ color: 'var(--text-muted)', background: 'var(--surface-2)', border: '1px solid var(--border)' }}
          onClick={() => onChange({ status: 'all', priority: 'all', assignedTo: 'all' })}
        >
          <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
          </svg>
          Clear
        </button>
      )}
    </div>
  )
}
