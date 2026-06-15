import express from 'express';
import cors from 'cors';

import userRoutes from '../../modules/user/routes/userRoutes.js';
import eventRoutes from '../../modules/event/routes/eventRoutes.js';
import notificationRoutes from '../../modules/notification/routes/notificationRoutes.js';

export const createTestApp = () => {
  const app = express();

  app.use(cors({ origin: '*', credentials: true }));
  app.use(express.json({ limit: '10mb' }));
  app.use(express.urlencoded({ extended: true }));

  app.use('/api/users', userRoutes);
  app.use('/api/events', eventRoutes);
  app.use('/api/notifications', notificationRoutes);

  app.get('/health', (req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
  });

  app.use((err, req, res, next) => {
    const statusCode = res.statusCode === 200 ? 500 : res.statusCode;
    res.status(statusCode).json({
      message: err.message,
      stack: process.env.NODE_ENV === 'production' ? null : err.stack,
    });
  });

  return app;
};
