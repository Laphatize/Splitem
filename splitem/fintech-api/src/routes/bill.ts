import { Router } from 'express';
import Bill from '../models/Bill';
import User from '../models/User';

const router = Router();

// Create bill
router.post('/', async (req, res) => {
  try {
    const { name, total, createdBy, participants } = req.body;
    const bill = new Bill({ name, total, createdBy, participants });
    await bill.save();
    // Add bill to users
    for (const p of participants) {
      await User.findByIdAndUpdate(p.user, { $push: { bills: bill._id } });
    }
    res.status(201).json(bill);
  } catch (err) {
    res.status(500).json({ message: 'Error creating bill' });
  }
});

// Get bills for a user
router.get('/user/:userId', async (req, res) => {
  try {
    const bills = await Bill.find({ 'participants.user': req.params.userId }).populate('participants.user', 'name email');
    res.json(bills);
  } catch (err) {
    res.status(500).json({ message: 'Error fetching bills' });
  }
});

// Mark participant as paid
router.post('/:billId/pay', async (req, res) => {
  try {
    const { userId } = req.body;
    const bill = await Bill.findById(req.params.billId);
    if (!bill) return res.status(404).json({ message: 'Bill not found' });
    const participant = bill.participants.find(p => p.user.toString() === userId);
    if (participant) participant.paid = true;
    bill.settled = bill.participants.every(p => p.paid);
    await bill.save();
    res.json(bill);
  } catch (err) {
    res.status(500).json({ message: 'Error updating bill' });
  }
});

export default router;
