// src/index.ts
import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';

import authRoutes from './routes/auth';
import billRoutes from './routes/bill';
import paypalRoutes from './routes/paypal';

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

app.use('/api/auth', authRoutes);
app.use('/api/bills', billRoutes);
app.use('/api/paypal', paypalRoutes);

const PORT = process.env.PORT || 4000;

mongoose.connect(process.env.MONGO_URI || '', { })
  .then(() => {
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  })
  .catch(err => {
    console.error('DB connection error:', err);
  });
