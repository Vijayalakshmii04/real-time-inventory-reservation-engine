-- CreateEnum
CREATE TYPE "ReservationState" AS ENUM ('ACTIVE', 'CONFIRMED', 'CANCELLED', 'EXPIRED');

-- CreateTable
CREATE TABLE "CatalogItem" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "details" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "CatalogItem_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "FulfillmentCenter" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "region" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "FulfillmentCenter_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "StockLedger" (
    "id" TEXT NOT NULL,
    "catalogItemId" TEXT NOT NULL,
    "fulfillmentId" TEXT NOT NULL,
    "physicalUnits" INTEGER NOT NULL,
    "allocatedUnits" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "StockLedger_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ReservationRecord" (
    "id" TEXT NOT NULL,
    "stockLedgerId" TEXT NOT NULL,
    "unitsReserved" INTEGER NOT NULL,
    "state" "ReservationState" NOT NULL DEFAULT 'ACTIVE',
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "confirmedAt" TIMESTAMP(3),
    "cancelledAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ReservationRecord_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "StockLedger_catalogItemId_fulfillmentId_key" ON "StockLedger"("catalogItemId", "fulfillmentId");

-- AddForeignKey
ALTER TABLE "StockLedger" ADD CONSTRAINT "StockLedger_catalogItemId_fkey" FOREIGN KEY ("catalogItemId") REFERENCES "CatalogItem"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StockLedger" ADD CONSTRAINT "StockLedger_fulfillmentId_fkey" FOREIGN KEY ("fulfillmentId") REFERENCES "FulfillmentCenter"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ReservationRecord" ADD CONSTRAINT "ReservationRecord_stockLedgerId_fkey" FOREIGN KEY ("stockLedgerId") REFERENCES "StockLedger"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
