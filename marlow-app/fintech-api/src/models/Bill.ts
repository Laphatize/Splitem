import mongoose, { Document, Schema } from 'mongoose';

export interface IBill extends Document {
  name: string;
  total: number;
  createdBy: mongoose.Types.ObjectId;
  participants: {
    user: mongoose.Types.ObjectId;
    amount: number;
    paid: boolean;
  }[];
  settled: boolean;
  createdAt: Date;
}

const BillSchema = new Schema<IBill>({
  name: { type: String, required: true },
  total: { type: Number, required: true },
  createdBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  participants: [
    {
      user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
      amount: { type: Number, required: true },
      paid: { type: Boolean, default: false },
    },
  ],
  settled: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now },
});

export default mongoose.model<IBill>('Bill', BillSchema);
