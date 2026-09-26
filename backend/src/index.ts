import { createApp } from './app.ts';
import { ENV } from './config/env.ts';
import { connectDB } from './config/db.ts';

async function startServer() {
  // Connect to MongoDB Atlas (M0 Free Tier)
  await connectDB();

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
