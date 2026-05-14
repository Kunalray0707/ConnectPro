import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import Stripe from 'stripe';

import { createCheckoutSession } from './stripe/createCheckoutSession';
import { handleStripeWebhook } from './stripe/handleStripeWebhook';

dotenv.config();

const app = express();

// For normal JSON routes
app.use((req, res, next) => {
  // Stripe requires raw body on webhook route
  if (req.originalUrl === '/api/stripe-webhook') return next();
  return express.json()(req, res, next);
});

app.use(
  cors({
    origin: process.env.CORS_ORIGIN ?? '*',
    credentials: true,
  }),
);

app.get('/health', (_req, res) => {
  res.json({ ok: true });
});

app.post('/api/create-checkout-session', async (req, res) => {
  try {
    const session = await createCheckoutSession(req);
    res.json({ sessionId: session.id });
  } catch (err: any) {
    console.error('create-checkout-session error:', err);
    res.status(400).json({ error: err?.message ?? 'Bad request' });
  }
});

// Stripe webhook must receive raw body
app.post(
  '/api/stripe-webhook',
  express.raw({ type: 'application/json' }),
  async (req, res) => {
    try {
      const result = await handleStripeWebhook(req);
      res.json(result);
    } catch (err: any) {
      console.error('stripe-webhook error:', err);
      res.status(400).json({ error: err?.message ?? 'Webhook error' });
    }
  },
);

const port = Number(process.env.PORT ?? 4242);
app.listen(port, () => {
  console.log(`Stripe backend listening on http://localhost:${port}`);
});

