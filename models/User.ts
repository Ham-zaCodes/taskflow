/**
 * models/User.ts
 * Mongoose schema + model for application users.
 */

import mongoose, { Schema, Document, Model } from 'mongoose'
import bcrypt from 'bcryptjs'

// ─── Interface ────────────────────────────────────────────────────────────────

export interface IUser extends Document {
  name: string
  email: string
  password: string          // stored as bcrypt hash
  createdAt: Date
  updatedAt: Date
  comparePassword(candidate: string): Promise<boolean>
}

// ─── Schema ───────────────────────────────────────────────────────────────────

const UserSchema = new Schema<IUser>(
  {
    name: {
      type: String,
      required: [true, 'Name is required'],
      trim: true,
      maxlength: [100, 'Name cannot exceed 100 characters'],
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^\S+@\S+\.\S+$/, 'Please enter a valid email'],
    },
    password: {
      type: String,
      required: [true, 'Password is required'],
      minlength: [6, 'Password must be at least 6 characters'],
      select: false,   // never returned in queries by default
    },
  },
  { timestamps: true }
)

// ─── Hooks ────────────────────────────────────────────────────────────────────

/** Hash the password before saving whenever it has been modified */
UserSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next()
  const salt = await bcrypt.genSalt(12)
  this.password = await bcrypt.hash(this.password, salt)
  next()
})

// ─── Methods ─────────────────────────────────────────────────────────────────

/** Verify a plain-text password against the stored hash */
UserSchema.methods.comparePassword = async function (candidate: string): Promise<boolean> {
  return bcrypt.compare(candidate, this.password)
}

// ─── Export ───────────────────────────────────────────────────────────────────

// Prevent model re-compilation during hot-reload in development
const User: Model<IUser> =
  (mongoose.models.User as Model<IUser>) || mongoose.model<IUser>('User', UserSchema)

export default User
