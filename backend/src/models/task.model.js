import mongoose from 'mongoose';

const taskSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    title: { type: String, required: true, trim: true, maxlength: 140 },
    description: { type: String, trim: true, maxlength: 2000, default: '' },
    dueAt: { type: Date, required: true },
    startAt: { type: Date, default: null },
    endAt: { type: Date, default: null },
    priority: { type: String, enum: ['low', 'medium', 'high'], default: 'medium' },
    status: { type: String, enum: ['in_progress', 'completed'], default: 'in_progress' },
    completedAt: { type: Date, default: null }
  },
  { timestamps: true, versionKey: false }
);

taskSchema.index({ userId: 1, dueAt: 1, status: 1 });
taskSchema.index({ title: 'text', description: 'text' });

export const Task = mongoose.model('Task', taskSchema);
