/*
  Warnings:

  - The values [CANCELLED] on the enum `ReservationState` will be removed. If these variants are still used in the database, this will fail.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "ReservationState_new" AS ENUM ('ACTIVE', 'CONFIRMED', 'RELEASED', 'EXPIRED');
ALTER TABLE "ReservationRecord" ALTER COLUMN "state" DROP DEFAULT;
ALTER TABLE "ReservationRecord" ALTER COLUMN "state" TYPE "ReservationState_new" USING ("state"::text::"ReservationState_new");
ALTER TYPE "ReservationState" RENAME TO "ReservationState_old";
ALTER TYPE "ReservationState_new" RENAME TO "ReservationState";
DROP TYPE "ReservationState_old";
ALTER TABLE "ReservationRecord" ALTER COLUMN "state" SET DEFAULT 'ACTIVE';
COMMIT;
