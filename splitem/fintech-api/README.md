# Fintech Bill Splitting App Backend

## Features
- User registration/login (JWT)
- Bill creation, splitting, and tracking
- PayPal account linking (OAuth stub)
- Notifications (DB model, ready for future expansion)

## Structure
- `src/models/`: Mongoose models for User, Bill, Notification
- `src/routes/`: Express routes for auth, bills, PayPal
- `.env`: Environment variables (see below)

## Setup
1. Install dependencies:
   ```sh
   npm install
   ```
2. Set up MongoDB locally (or use MongoDB Atlas) and update `MONGO_URI` in `.env`.
3. Set up your PayPal app and update credentials in `.env`.
4. Start the server:
   ```sh
   npm run dev
   ```

## Environment Variables
- `MONGO_URI`: MongoDB connection string
- `JWT_SECRET`: Secret for JWT signing
- `PAYPAL_CLIENT_ID`: PayPal app client ID
- `PAYPAL_CLIENT_SECRET`: PayPal app secret
- `PAYPAL_REDIRECT_URI`: Redirect URI for PayPal OAuth
- `PORT`: Server port (default 4000)

---

This backend is ready for integration with the Expo React Native frontend.
