-- AlterTable
ALTER TABLE "adverts" ADD COLUMN     "backgroundImage" TEXT,
ADD COLUMN     "features" TEXT[],
ADD COLUMN     "imageUrl" TEXT,
ADD COLUMN     "price" TEXT,
ADD COLUMN     "secondaryLink" TEXT;
