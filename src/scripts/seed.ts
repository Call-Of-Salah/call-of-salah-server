import 'dotenv/config';

import { iocGetPrismaClient } from '../common/ioc.js';
import { seedMasajid } from './seeders/index.js';

async function main(): Promise<void> {
  const prisma = iocGetPrismaClient();

  await seedMasajid(prisma);
}

main()
  .catch((err: unknown) => {
    console.error(err);
    process.exitCode = 1;
  })
  .finally(async () => {
    await iocGetPrismaClient().$disconnect();
  });
