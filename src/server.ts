import { createApp } from './app.js';
import { config } from './config/index.js';
import { createProviders } from './providers/index.js';
import { registerJobs } from './jobs/index.js';
import { prisma } from './providers/database/prisma.js';

async function main(): Promise<void> {
  const providers = createProviders();
  registerJobs(providers.scheduler);
  providers.scheduler.start();

  const app = createApp();
  const server = app.listen(config.port, () => {
    console.info(`Call of Salah API listening on :${config.port} (${config.nodeEnv})`);
  });

  const shutdown = async (signal: string) => {
    console.info(`${signal} received — shutting down`);
    providers.scheduler.stop();
    server.close(async () => {
      await prisma.$disconnect();
      process.exit(0);
    });
  };

  process.on('SIGTERM', () => void shutdown('SIGTERM'));
  process.on('SIGINT', () => void shutdown('SIGINT'));
}

main().catch((err) => {
  console.error('Failed to start server', err);
  process.exit(1);
});
