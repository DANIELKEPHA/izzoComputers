-- CreateTable
CREATE TABLE "counties" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,

    CONSTRAINT "counties_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "towns" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "postalCode" TEXT NOT NULL,
    "countyId" INTEGER NOT NULL,

    CONSTRAINT "towns_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "user_delivery_locations" (
    "id" SERIAL NOT NULL,
    "userId" TEXT NOT NULL,
    "countyId" INTEGER NOT NULL,
    "townId" INTEGER NOT NULL,

    CONSTRAINT "user_delivery_locations_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "counties_name_key" ON "counties"("name");

-- CreateIndex
CREATE INDEX "towns_countyId_idx" ON "towns"("countyId");

-- CreateIndex
CREATE UNIQUE INDEX "towns_name_countyId_key" ON "towns"("name", "countyId");

-- CreateIndex
CREATE UNIQUE INDEX "user_delivery_locations_userId_key" ON "user_delivery_locations"("userId");

-- AddForeignKey
ALTER TABLE "towns" ADD CONSTRAINT "towns_countyId_fkey" FOREIGN KEY ("countyId") REFERENCES "counties"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_delivery_locations" ADD CONSTRAINT "user_delivery_locations_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("cognitoId") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_delivery_locations" ADD CONSTRAINT "user_delivery_locations_countyId_fkey" FOREIGN KEY ("countyId") REFERENCES "counties"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_delivery_locations" ADD CONSTRAINT "user_delivery_locations_townId_fkey" FOREIGN KEY ("townId") REFERENCES "towns"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
