-- CreateTable
CREATE TABLE "masajid" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "name" VARCHAR(100) NOT NULL,
    "address_line1" VARCHAR(100) NOT NULL,
    "address_line2" VARCHAR(100),
    "city" VARCHAR(60) NOT NULL,
    "postcode" VARCHAR(10) NOT NULL,
    "latitude" DOUBLE PRECISION NOT NULL,
    "longitude" DOUBLE PRECISION NOT NULL,
    "geofence_radius_metres" INTEGER NOT NULL DEFAULT 200,
    "admin_user_id" UUID,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "masajid_pkey" PRIMARY KEY ("id")
);
