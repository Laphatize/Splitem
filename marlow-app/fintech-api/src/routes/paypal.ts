import { Router } from 'express';
import User from '../models/User';
import axios from 'axios';

const router = Router();

// Start PayPal OAuth
router.get('/link', (req, res) => {
  // For a real app, use PayPal Connect with OAuth2
  const redirect = `https://www.sandbox.paypal.com/connect?flowEntry=static&client_id=${process.env.PAYPAL_CLIENT_ID}&scope=openid profile email https://uri.paypal.com/services/paypalattributes&redirect_uri=${process.env.PAYPAL_REDIRECT_URI}`;
  res.json({ url: redirect });
});

// Handle PayPal OAuth callback
router.get('/callback', async (req, res) => {
  // Exchange code for access token, get user info, link to user
  // (Stub: in production, use real OAuth2 flow)
  const { code, userId } = req.query;
  // Example: Exchange code for access token
  // const response = await axios.post('https://api.sandbox.paypal.com/v1/oauth2/token', ...)
  // For now, just stub
  await User.findByIdAndUpdate(userId, { paypalId: 'stub-paypal-id' });
  res.json({ message: 'PayPal linked' });
});

export default router;
