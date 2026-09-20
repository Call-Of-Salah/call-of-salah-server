import type { PrismaClient } from '../../generated/prisma/client.js';

const masajidSeed = [
  {
    name: 'Khizra Mosque',
    addressLine1: '117 Anson Road',
    city: 'Manchester',
    postcode: 'M14 5BY',
    latitude: 53.4514,
    longitude: -2.2211,
  },
  {
    name: 'Didsbury Mosque',
    addressLine1: '270 Burton Road',
    city: 'Manchester',
    postcode: 'M20 2LW',
    latitude: 53.4232,
    longitude: -2.2372,
  },
];

export async function seedMasajid(prisma: PrismaClient): Promise<void> {
  for (const masjid of masajidSeed) {
    const existing = await prisma.masjid.findFirst({ where: { name: masjid.name } });

    if (existing) {
      console.log(`skip (already exists): ${masjid.name}`);
      continue;
    }

    const created = await prisma.masjid.create({ data: masjid });
    console.log(`created: ${created.name} (${created.id})`);
  }
}
