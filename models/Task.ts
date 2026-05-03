/**
 * models/Task.ts
 * Mongoose schema + model for tasks.
 */

import mongoose, { Schema, Document, Model, Types } from 'mongoose'

// ─── Interface ────────────────────────────────────────────────────────────────

export interface ITask extends Document {
  title: string
  description?: string
  priority: 'low' | 'medium' | 'high'
  status: 'pending' | 'completed'
  dueDate?: Date
  assignedTo?: Types.ObjectId    // reference to User
  createdBy: Types.ObjectId      // reference to User
  createdAt: Date
  updatedAt: Date
}

// ─── Schema ───────────────────────────────────────────────────────────────────

const TaskSchema = new Schema<ITask>(
  {
    title: {
      type: String,
      required: [true, 'Task title is required'],
      trim: true,
      maxlength: [200, 'Title cannot exceed 200 characters'],
    },
    description: {
      type: String,
      trim: true,
      maxlength: [1000, 'Description cannot exceed 1000 characters'],
    },
    priority: {
      type: String,
      enum: ['low', 'medium', 'high'],
      default: 'medium',
    },
    status: {
      type: String,
      enum: ['pending', 'completed'],
      default: 'pending',
    },
    dueDate: {
      type: Date,
    },
    assignedTo: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
    createdBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
  },
  { timestamps: true }
)

// ─── Indexes ──────────────────────────────────────────────────────────────────

// Speed up common dashboard queries
TaskSchema.index({ createdBy: 1, status: 1 })
TaskSchema.index({ assignedTo: 1, status: 1 })
TaskSchema.index({ dueDate: 1 })

// ─── Export ───────────────────────────────────────────────────────────────────

const Task: Model<ITask> =
  (mongoose.models.Task as Model<ITask>) || mongoose.model<ITask>('Task', TaskSchema)

export default Task
