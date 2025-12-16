-- AlterTable
ALTER TABLE "Product" ADD COLUMN     "averageRating" DECIMAL(3,2),
ADD COLUMN     "discountPercent" INTEGER,
ADD COLUMN     "reviewCount" INTEGER DEFAULT 0,
ADD COLUMN     "warranty" TEXT;
