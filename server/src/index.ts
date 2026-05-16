import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import http from 'http';
import { Server as SocketIOServer } from 'socket.io';

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
    res.json({ sessionId: session.id, url: session.url });
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

const httpServer = http.createServer(app);

const io = new SocketIOServer(httpServer, {
  cors: {
    // During local dev Vite can run on different ports (5173/5174).
    origin: '*',
    credentials: true,
  },
});

type OverviewStatPayload = {
  profileViews: number;
  connections: number;
  messages: number;
  avgRating: number;
};

type OverviewActivityDay = {
  day: string;
  views: number;
  connections: number;
};

type OverviewActivityPayload = OverviewActivityDay[];

const seededActivity: OverviewActivityPayload = [
  { day: 'Mon', views: 24, connections: 4 },
  { day: 'Tue', views: 38, connections: 7 },
  { day: 'Wed', views: 31, connections: 5 },
  { day: 'Thu', views: 52, connections: 11 },
  { day: 'Fri', views: 47, connections: 9 },
  { day: 'Sat', views: 63, connections: 14 },
  { day: 'Sun', views: 58, connections: 12 },
];

function driftInt(base: number, maxDelta: number): number {
  const delta = Math.round((Math.random() * 2 - 1) * maxDelta);
  return Math.max(0, base + delta);
}

function chatRoomKey(userId: string, professionalId: string) {
  // Deterministic room for a pair
  return `chat:${userId}:${professionalId}`;
}

io.on('connection', (socket) => {
  socket.on('join', (payload: { room?: string }) => {
    const room = payload?.room;
    if (!room) return;
    socket.join(room);
  });

  socket.on('typing', (_payload: unknown) => {
    // placeholder (extended later)
  });

  socket.on('disconnect', () => {
    // placeholder (extended later)
  });

  socket.emit('connected', { ok: true });

  // ===== Chat baseline events =====

  socket.on(
    'chat:send',
    (payload: {
      userId: string;
      professionalId: string;
      text: string;
    }) => {
      const { userId, professionalId, text } = payload ?? {};
      if (!userId || !professionalId) return;
      const trimmed = String(text ?? '').trim();
      if (!trimmed) return;

      const room = chatRoomKey(userId, professionalId);

      // Message shape expected by frontend (ProfileChat)
      const message = {
        id: `m-${Date.now()}-${Math.random().toString(16).slice(2)}`,
        sender: 'user' as const,
        text: trimmed,
        status: 'sent' as const,
        createdAt: new Date().toISOString(),
      };

      io.to(room).emit('chat:message', message);
    },
  );

  socket.on(
    'chat:typing',
    (payload: {
      userId: string;
      professionalId: string;
      typing: boolean;
    }) => {
      const { userId, professionalId, typing } = payload ?? {};
      if (!userId || !professionalId) return;

      const room = chatRoomKey(userId, professionalId);
      socket.to(room).emit('chat:typing', {
        userId,
        professionalId,
        typing: Boolean(typing),
      });
    },
  );

  socket.on(
    'chat:presence',
    (payload: { userId: string; professionalId: string; online: boolean }) => {
      const { userId, professionalId, online } = payload ?? {};
      if (!userId || !professionalId) return;

      const room = chatRoomKey(userId, professionalId);
      socket.to(room).emit('chat:presence', {
        userId,
        professionalId,
        online: Boolean(online),
      });
    },
  );
});

// Real-time Overview baseline: broadcast updates to everyone every 3s.
setInterval(() => {
  const activity = seededActivity.map((d) => ({
    ...d,
    views: driftInt(d.views, 6),
    connections: driftInt(d.connections, 2),
  }));

  const stats: OverviewStatPayload = {
    profileViews: driftInt(1284, 30),
    connections: driftInt(347, 10),
    messages: driftInt(89, 6),
    avgRating: Math.round((4.8 + (Math.random() - 0.5) * 0.08) * 10) / 10,
  };

  io.emit('overview:stats', stats);
  io.emit('overview:activity', activity);
}, 3000);

httpServer.listen(port, () => {
  console.log(`Stripe backend listening on http://localhost:${port}`);
  console.log(`Socket.IO listening on http://localhost:${port}`);
});
