-- CreateEnum
CREATE TYPE "PrayerName" AS ENUM ('FAJR', 'DHUHR', 'ASR', 'MAGHRIB', 'ISHA');

-- CreateTable
CREATE TABLE "masjid_prayer_times" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "masjid_id" UUID NOT NULL,
    "date" DATE NOT NULL,
    "prayer" "PrayerName" NOT NULL,
    "jamaat_time" TIME(0) NOT NULL,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "masjid_prayer_times_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "idx_prayer_times_lookup" ON "masjid_prayer_times"("masjid_id", "date");

-- CreateIndex
CREATE UNIQUE INDEX "uq_prayer_time" ON "masjid_prayer_times"("masjid_id", "date", "prayer");

-- AddForeignKey
ALTER TABLE "masjid_prayer_times" ADD CONSTRAINT "masjid_prayer_times_masjid_id_fkey" FOREIGN KEY ("masjid_id") REFERENCES "masajid"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
