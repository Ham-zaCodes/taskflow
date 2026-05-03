/**
 * app/api/tasks/route.ts
 * GET  /api/tasks   – list all tasks visible to the current user
 * POST /api/tasks   – create a new task
 */

import { NextRequest } from 'next/server'
import { getAuthUser } from '@/lib/auth'
import { connectDB } from '@/lib/mongodb'
import { ok, err } from '@/lib/api'
import Task from '@/models/Task'

// ─── GET /api/tasks ──────────────────────────────────────────────────────────

export async function GET(request: NextRequest) {
  const auth = await getAuthUser()
  if (!auth) return err('Not authenticated', 401)

  await connectDB()

  const { searchParams } = new URL(request.url)
  const status   = searchParams.get('status')    // 'pending' | 'completed'
  const priority = searchParams.get('priority')  // 'low' | 'medium' | 'high'

  // Build a filter: show tasks created by OR assigned to the user
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const filter: Record<string, any> = {
    $or: [{ createdBy: auth.userId }, { assignedTo: auth.userId }],
  }

  if (status   && ['pending', 'completed'].includes(status))          filter.status   = status
  if (priority && ['low', 'medium', 'high'].includes(priority)) filter.priority = priority

  const tasks = await Task.find(filter)
    .populate('assignedTo', '_id name email')
    .populate('createdBy', '_id name email')
    .sort({ createdAt: -1 })
    .lean()

  return ok(tasks)
}

// ─── POST /api/tasks ─────────────────────────────────────────────────────────

export async function POST(request: NextRequest) {
  const auth = await getAuthUser()
  if (!auth) return err('Not authenticated', 401)

  const body = await request.json()
  const { title, description, priority, dueDate, assignedTo } = body

  if (!title?.trim()) return err('Title is required', 400)

  await connectDB()

  const task = await Task.create({
    title: title.trim(),
    description: description?.trim(),
    priority: priority ?? 'medium',
    dueDate: dueDate ? new Date(dueDate) : undefined,
    assignedTo: assignedTo || null,
    createdBy: auth.userId,
  })

  // Re-fetch with populated fields so the client gets full user objects
  const populated = await Task.findById(task._id)
    .populate('assignedTo', '_id name email')
    .populate('createdBy', '_id name email')
    .lean()

  return ok(populated, 'Task created', 201)
}
