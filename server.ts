import { createApp } from './backend/src/app.ts';
import { connectDB } from './backend/src/config/db.ts';

async function startServer() {
  await connectDB();
  const app = await createApp();
  const PORT = 3000;

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`SHEETALDHARA CHS server running on http://0.0.0.0:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('Failed to start server:', err);
  process.exit(1);
});

