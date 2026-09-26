import { Router } from 'express';
import { isDbConnected, getDbStatus } from '../config/db.ts';
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

// Resilient fallback middleware:
// If MongoDB Atlas is not currently connected (e.g., awaiting Atlas IP whitelisting),
// automatically and seamlessly route API requests to the persistent local database.
apiRouter.use((req, res, next) => {
  if (!isDbConnected()) {
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
