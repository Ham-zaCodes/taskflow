'use client'
/**
 * components/tasks/TaskCard.tsx
 * Displays a single task with actions: toggle status, edit, delete.
 */

import { useState } from 'react'
import { format, isPast, isToday } from 'date-fns'
import type { Task } from '@/types'

interface Props {
  task: Task
  currentUserId: string
  onToggle:  (id: string, status: 'pending' | 'completed') => Promise<void>
  onEdit:    (task: Task) => void
  onDelete:  (id: string) => Promise<void>
}

const priorityLabel: Record<string, string> = { low: 'Low', medium: 'Medium', high: 'High' }

export function TaskCard({ task, currentUserId, onToggle, onEdit, onDelete }: Props) {
  const [toggling, setToggling] = useState(false)
  const [deleting, setDeleting] = useState(false)

  const isCompleted = task.status === 'completed'
  const assignee    = typeof task.assignedTo === 'object' ? task.assignedTo : null
  const creator     = typeof task.createdBy  === 'object' ? task.createdBy  : null
  const isOwner     = creator?._id === currentUserId

  // Due date formatting / overdue detection
  const dueDate = task.dueDate ? new Date(task.dueDate) : null
  const overdue = dueDate && !isCompleted && isPast(dueDate) && !isToday(dueDate)
  const dueToday = dueDate && isToday(dueDate) && !isCompleted

  const handleToggle = async () => {
    setToggling(true)
    await onToggle(task._id, isCompleted ? 'pending' : 'completed')
    setToggling(false)
  }

  const handleDelete = async () => {
    if (!confirm('Delete this task?')) return
    setDeleting(true)
    await onDelete(task._id)
  }

  return (
    <div
      className={`card p-4 transition-all duration-200 animate-fade-in ${
        isCompleted ? 'opacity-60' : ''
      }`}
    >
      <div className="flex items-start gap-3">
        {/* Completion checkbox */}
        <button
          onClick={handleToggle}
          disabled={toggling}
          className="mt-0.5 flex-shrink-0 w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all"
          style={{
            borderColor: isCompleted ? 'var(--priority-low)' : 'var(--border)',
            background:  isCompleted ? 'var(--priority-low)' : 'transparent',
          }}
          title={isCompleted ? 'Mark as pending' : 'Mark as complete'}
        >
          {isCompleted && (
            <svg width="10" height="10" viewBox="0 0 12 12" fill="none" stroke="white" strokeWidth="2.5">
              <path d="M2 6l3 3 5-5"/>
            </svg>
          )}
        </button>

        {/* Content */}
        <div className="flex-1 min-w-0">
          {/* Title row */}
          <div className="flex items-start justify-between gap-2">
            <h3
              className={`font-500 text-sm leading-snug ${isCompleted ? 'line-through' : ''}`}
              style={{ color: isCompleted ? 'var(--text-muted)' : 'var(--text)' }}
            >
              {task.title}
            </h3>

            {/* Action buttons – only owner can edit/delete */}
            {isOwner && (
              <div className="flex items-center gap-1 flex-shrink-0">
                <button
                  onClick={() => onEdit(task)}
                  className="w-7 h-7 rounded flex items-center justify-center transition-colors"
                  style={{ color: 'var(--text-muted)' }}
                  onMouseEnter={e => (e.currentTarget.style.color = 'var(--text)')}
                  onMouseLeave={e => (e.currentTarget.style.color = 'var(--text-muted)')}
                  title="Edit task"
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"/>
                    <path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"/>
                  </svg>
                </button>
                <button
                  onClick={handleDelete}
                  disabled={deleting}
                  className="w-7 h-7 rounded flex items-center justify-center transition-colors"
                  style={{ color: 'var(--text-muted)' }}
                  onMouseEnter={e => (e.currentTarget.style.color = 'var(--priority-high)')}
                  onMouseLeave={e => (e.currentTarget.style.color = 'var(--text-muted)')}
                  title="Delete task"
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 01-2 2H8a2 2 0 01-2-2L5 6"/>
                    <path d="M10 11v6"/><path d="M14 11v6"/><path d="M9 6V4a1 1 0 011-1h4a1 1 0 011 1v2"/>
                  </svg>
                </button>
              </div>
            )}
          </div>

          {/* Description */}
          {task.description && (
            <p className="text-xs mt-1 line-clamp-2" style={{ color: 'var(--text-muted)' }}>
              {task.description}
            </p>
          )}

          {/* Meta row */}
          <div className="flex flex-wrap items-center gap-2 mt-3">
            {/* Priority badge */}
            <span className={`badge badge-${task.priority}`}>
              {priorityLabel[task.priority]}
            </span>

            {/* Status */}
            <span className={`badge badge-${task.status}`}>
              {isCompleted ? 'Done' : 'Pending'}
            </span>

            {/* Due date */}
            {dueDate && (
              <span
                className="text-xs flex items-center gap-1"
                style={{
                  color: overdue ? 'var(--priority-high)'
                       : dueToday ? 'var(--priority-medium)'
                       : 'var(--text-muted)',
                }}
              >
                <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
                  <line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/>
                  <line x1="3" y1="10" x2="21" y2="10"/>
                </svg>
                {overdue ? 'Overdue · ' : dueToday ? 'Due today · ' : ''}
                {format(dueDate, 'MMM d')}
              </span>
            )}

            {/* Assignee */}
            {assignee && (
              <span className="text-xs flex items-center gap-1" style={{ color: 'var(--text-muted)' }}>
                <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/>
                  <circle cx="12" cy="7" r="4"/>
                </svg>
                {assignee.name}
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
