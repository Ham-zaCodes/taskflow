'use client'
/**
 * components/tasks/TaskModal.tsx
 * Modal dialog for creating or editing a task.
 */

import { useState, useEffect, FormEvent } from 'react'
import type { Task, User, CreateTaskPayload } from '@/types'

interface Props {
  task?:      Task | null       // if provided → edit mode
  users:      User[]
  onSave:     (payload: CreateTaskPayload) => Promise<void>
  onClose:    () => void
}

export function TaskModal({ task, users, onSave, onClose }: Props) {
  const [title,       setTitle]       = useState(task?.title ?? '')
  const [description, setDescription] = useState(task?.description ?? '')
  const [priority,    setPriority]    = useState<'low'|'medium'|'high'>(task?.priority ?? 'medium')
  const [dueDate,     setDueDate]     = useState(
    task?.dueDate ? task.dueDate.slice(0, 10) : ''
  )
  const [assignedTo,  setAssignedTo]  = useState(
    typeof task?.assignedTo === 'object' ? (task.assignedTo?._id ?? '') : (task?.assignedTo ?? '')
  )
  const [loading,     setLoading]     = useState(false)
  const [error,       setError]       = useState<string | null>(null)

  // Close on Escape key
  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [onClose])

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    if (!title.trim()) { setError('Title is required'); return }
    setError(null)
    setLoading(true)
    try {
      await onSave({
        title: title.trim(),
        description: description.trim() || undefined,
        priority,
        dueDate: dueDate || undefined,
        assignedTo: assignedTo || undefined,
      })
      onClose()
    } catch {
      setError('Something went wrong. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="modal-overlay" onClick={e => { if (e.target === e.currentTarget) onClose() }}>
      <div className="modal-box p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-5">
          <h2 className="font-display text-lg font-600" style={{ color: 'var(--text)' }}>
            {task ? 'Edit task' : 'New task'}
          </h2>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg flex items-center justify-center transition-colors"
            style={{ color: 'var(--text-muted)' }}
            onMouseEnter={e => (e.currentTarget.style.background = 'var(--surface-2)')}
            onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
          </button>
        </div>

        {error && (
          <div className="mb-4 p-3 rounded-lg text-sm"
            style={{ background: 'rgba(239,68,68,0.1)', color: 'var(--priority-high)', border: '1px solid rgba(239,68,68,0.2)' }}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Title */}
          <div>
            <label className="block text-sm font-500 mb-1.5" style={{ color: 'var(--text-muted)' }}>
              Title <span style={{ color: 'var(--priority-high)' }}>*</span>
            </label>
            <input
              className="input"
              value={title}
              onChange={e => setTitle(e.target.value)}
              placeholder="What needs to be done?"
              required
              autoFocus
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-500 mb-1.5" style={{ color: 'var(--text-muted)' }}>
              Description <span style={{ fontSize: '0.72rem' }}>(optional)</span>
            </label>
            <textarea
              className="input"
              value={description}
              onChange={e => setDescription(e.target.value)}
              placeholder="Add more context…"
              rows={3}
              style={{ resize: 'vertical', fontFamily: 'var(--font-body)' }}
            />
          </div>

          {/* Priority + Due date */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-500 mb-1.5" style={{ color: 'var(--text-muted)' }}>
                Priority
              </label>
              <select className="input" value={priority} onChange={e => setPriority(e.target.value as 'low'|'medium'|'high')}>
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-500 mb-1.5" style={{ color: 'var(--text-muted)' }}>
                Due date
              </label>
              <input
                className="input"
                type="date"
                value={dueDate}
                onChange={e => setDueDate(e.target.value)}
                style={{ colorScheme: 'dark' }}
              />
            </div>
          </div>

          {/* Assign to */}
          <div>
            <label className="block text-sm font-500 mb-1.5" style={{ color: 'var(--text-muted)' }}>
              Assign to
            </label>
            <select className="input" value={assignedTo} onChange={e => setAssignedTo(e.target.value)}>
              <option value="">Unassigned</option>
              {users.map(u => (
                <option key={u._id} value={u._id}>{u.name} ({u.email})</option>
              ))}
            </select>
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-2">
            <button type="button" className="btn btn-ghost flex-1" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary flex-1" disabled={loading}>
              {loading ? 'Saving…' : task ? 'Save changes' : 'Create task'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
