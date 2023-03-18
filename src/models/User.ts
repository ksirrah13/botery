import { Schema, model } from 'mongoose';

interface IUser {
  name: string;
  userId: string;
  email: string;
}

const UserSchema = new Schema<IUser>({
  name: { type: String, required: true },
  userId: { type: String, required: true },
  email: { type: String, required: true },
});

export const User = model<IUser>('User', UserSchema);
