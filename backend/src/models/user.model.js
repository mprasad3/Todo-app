import mongoose from 'mongoose';

const userSchema = new mongoose.Schema(
  {
    username: { type: String, required: true, trim: true, minlength: 2, maxlength: 40 },
    usernameKey: { type: String, required: true, unique: true, index: true }
  },
  { timestamps: true, versionKey: false }
);

export const User = mongoose.model('User', userSchema);
