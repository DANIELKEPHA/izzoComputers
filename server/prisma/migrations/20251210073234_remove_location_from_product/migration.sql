/*
  Warnings:

  - You are about to drop the column `locationId` on the `Product` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "Product" DROP CONSTRAINT "Product_locationId_fkey";

-- AlterTable
ALTER TABLE "Product" DROP COLUMN "locationId",
ALTER COLUMN "description" DROP NOT NULL;
