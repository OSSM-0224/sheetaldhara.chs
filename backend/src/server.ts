import { createApp } from './app.ts';
import { ENV } from './config/env.ts';

async function startServer() {
  const app = await createApp();
  const PORT = ENV.PORT;

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`[Backend] Society Vehicle Lookup Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('[Backend] Fatal error during startup:', err);
  process.exit(1);
});

export { startServer };
