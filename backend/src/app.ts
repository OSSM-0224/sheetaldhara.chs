import express from 'express';
import path from 'path';
import fs from 'fs';
import cookieParser from 'cookie-parser';
import { createServer as createViteServer } from 'vite';
import { apiRouter } from './routes/index.ts';
import { parseSession } from './middleware/auth.ts';
import { cors } from './middleware/cors.ts';
import { enforceTrustedOrigin } from './middleware/csrf.ts';
import { errorHandler } from './middleware/errorHandler.ts';
import { ENV } from './config/env.ts';

export async function createApp() {
  const app = express();
  const cwd = process.cwd();
  const projectRoot = fs.existsSync(path.join(cwd, 'frontend')) ? cwd : path.resolve(cwd, '..');

  // Trust reverse proxy (Cloud Run / load balancer) for accurate IP resolution
  app.set('trust proxy', 1);

  // Must run before routes so preflights and error responses are handled too.
  app.use(cors);

  // Reject state-changing requests from origins outside the allowlist. Runs after
  // cors() so OPTIONS preflights are already short-circuited.
  app.use(enforceTrustedOrigin);

  // Basic security and parsing middlewares
  app.use(express.json());
  // Sign cookies with COOKIE_SECRET. The JWT signature is the real integrity
  // check on society_token, but signing means a tampered cookie is rejected at
  // the edge rather than being parsed as if it were valid.
  app.use(cookieParser(ENV.COOKIE_SECRET));
  app.use(parseSession);

  // Mount all API routes under /api
  app.use('/api', apiRouter);

  // Client SPA serving: In dev mode use Vite middleware; in prod serve static files
  if (process.env.NODE_ENV !== 'production') {
    try {
      const frontendRoot = path.join(projectRoot, 'frontend');
      const vite = await createViteServer({
        root: frontendRoot,
        configFile: path.join(projectRoot, 'vite.config.ts'),
        server: { middlewareMode: true },
        appType: 'spa',
      });
      app.use(vite.middlewares);
    } catch (viteErr) {
      console.error('Failed to attach Vite middleware in dev:', viteErr);
    }
  } else {
    const frontendDist = path.join(projectRoot, 'frontend', 'dist');
    const rootDist = path.join(projectRoot, 'dist');
    const distPath = fs.existsSync(frontendDist) ? frontendDist : rootDist;

    // Only serve static files when a real frontend build is present. On an API-only
    // deploy `dist/` holds just the server bundle, and statically serving it would
    // publish server.cjs and its source map to anyone who requests them.
    if (fs.existsSync(path.join(distPath, 'index.html'))) {
      app.use(express.static(distPath));
      app.get('*', (req, res, next) => {
        if (req.path.startsWith('/api')) {
          return next();
        }
        res.sendFile(path.join(distPath, 'index.html'));
      });
    }
  }

  // Global error handler
  app.use(errorHandler);

  return app;
}
