import { Router } from 'express';
import { isDbConnected, getDbStatus } from '../config/db.ts';
import { rateLimitApiGlobal } from '../middleware/rateLimiters.ts';
import { authRouter } from './auth.routes.ts';
import { searchRouter } from './search.routes.ts';
import { residentsRouter } from './residents.routes.ts';
import { watchmanRouter } from './watchman.routes.ts';
import { adminRouter } from './admin.routes.ts';

export const apiRouter = Router();

// Wide backstop across the whole API surface. Individual routes apply their own
// tighter limiters on top of this.
apiRouter.use(rateLimitApiGlobal);

// DB status endpoint to inform frontend of active database mode
apiRouter.get('/db-status', (req, res) => {
  res.json(getDbStatus());
});

apiRouter.get('/health', (req, res) => {
  res.json({
    status: isDbConnected() ? 'ok' : 'degraded',
    database: isDbConnected() ? 'mongodb' : 'disconnected',
    timestamp: new Date().toISOString(),
  });
});

apiRouter.use('/auth', authRouter);
apiRouter.use('/search', searchRouter);
apiRouter.use('/', residentsRouter); // exposes /my-vehicles under /api/my-vehicles
apiRouter.use('/watchman', watchmanRouter);
apiRouter.use('/admin', adminRouter);
