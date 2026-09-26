import { Router } from 'express';
import { isDbConnected, isLocalMode, getDbStatus } from '../config/db.ts';
import { apiRouter as localApiRouter } from '../../../server/routes.ts';
import { authRouter } from './auth.routes.ts';
import { searchRouter } from './search.routes.ts';
import { residentsRouter } from './residents.routes.ts';
import { watchmanRouter } from './watchman.routes.ts';
import { adminRouter } from './admin.routes.ts';

export const apiRouter = Router();

// DB status endpoint to inform frontend of active database mode
apiRouter.get('/db-status', (req, res) => {
  res.json(getDbStatus());
});

apiRouter.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    database: isDbConnected() ? 'mongodb_atlas' : 'local_storage',
    timestamp: new Date().toISOString(),
  });
});

// Local-storage mode is only entered when MONGODB_URI is deliberately unset.
// If MongoDB was configured but drops, requests must fail instead of silently
// falling back to a per-instance store and splitting data across instances.
apiRouter.use((req, res, next) => {
  if (isLocalMode()) {
    return localApiRouter(req, res, next);
  }
  next();
});

// MongoDB Atlas routers (active when MongoDB Atlas is connected)
apiRouter.use('/auth', authRouter);
apiRouter.use('/search', searchRouter);
apiRouter.use('/', residentsRouter); // exposes /my-vehicles under /api/my-vehicles
apiRouter.use('/watchman', watchmanRouter);
apiRouter.use('/admin', adminRouter);
