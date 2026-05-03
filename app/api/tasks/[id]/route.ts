/**
 * app/api/tasks/[id]/route.ts
 * GET    /api/tasks/:id  – fetch a single task
 * PATCH  /api/tasks/:id  – update a task (edit fields OR toggle status)
 * DELETE /api/tasks/:id  – delete a task
 *
 * Only the task creator may update or delete it.
 */

import { NextRequest } from 'next/server'
import { getAuthUser } from '@/lib/auth'
import { connectDB } from '@/lib/mongodb'
import { ok, err } from '@/lib/api'
import Task from '@/models/Task'
import "@/models/User";

interface Params { params: { id: string } }

// ─── GET /api/tasks/:id ───────────────────────────────────────────────────────

export async function GET(_req: NextRequest, { params }: Params) {
  const auth = await getAuthUser()
  if (!auth) return err('Not authenticated', 401)

  await connectDB()

  const task = await Task.findById(params.id)
    .populate('assignedTo', '_id name email')
    .populate('createdBy', '_id name email')
    .lean()

  if (!task) return err('Task not found', 404)

  return ok(task)
}

// ─── PATCH /api/tasks/:id ─────────────────────────────────────────────────────

export async function PATCH(request: NextRequest, { params }: Params) {
  const auth = await getAuthUser()
  if (!auth) return err('Not authenticated', 401)

  await connectDB()

  const task = await Task.findById(params.id)
  if (!task) return err('Task not found', 404)

  // Only the creator can edit the task
  if (task.createdBy.toString() !== auth.userId) {
    return err('You are not authorised to edit this task', 403)
  }

  const body = await request.json()
  const { title, description, priority, status, dueDate, assignedTo } = body

  // Apply updates selectively so we don't overwrite unchanged fields
  if (title       !== undefined) task.title       = title.trim()
  if (description !== undefined) task.description = description?.trim()
  if (priority    !== undefined) task.priority    = priority
  if (status      !== undefined) task.status      = status
  if (dueDate     !== undefined) task.dueDate     = dueDate ? new Date(dueDate) : undefined
  if (assignedTo  !== undefined) task.assignedTo  = assignedTo || null

  await task.save()

  const updated = await Task.findById(task._id)
    .populate('assignedTo', '_id name email')
    .populate('createdBy', '_id name email')
    .lean()

  return ok(updated, 'Task updated')
}

// ─── DELETE /api/tasks/:id ────────────────────────────────────────────────────

export async function DELETE(_req: NextRequest, { params }: Params) {
  const auth = await getAuthUser()
  if (!auth) return err('Not authenticated', 401)

  await connectDB()

  const task = await Task.findById(params.id)
  if (!task) return err('Task not found', 404)

  // Only the creator can delete
  if (task.createdBy.toString() !== auth.userId) {
    return err('You are not authorised to delete this task', 403)
  }

  await task.deleteOne()

  return ok(null, 'Task deleted')
}
