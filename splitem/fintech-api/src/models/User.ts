import mongoose, { Document, Schema } from 'mongoose';

export interface IUser extends Document {
  email: string;
  password: string;
  name: string;
  paypalId?: string;
  bills: mongoose.Types.ObjectId[];
}

const UserSchema = new Schema<IUser>({
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  name: { type: String, required: true },
  paypalId: { type: String },
  bills: [{ type: Schema.Types.ObjectId, ref: 'Bill' }],
});

export default mongoose.model<IUser>('User', UserSchema);
