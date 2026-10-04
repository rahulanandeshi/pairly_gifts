-- AlterTable
ALTER TABLE "GiftBrand" ADD COLUMN     "tremendousProductId" TEXT;

-- AlterTable
ALTER TABLE "GiftCardInstance" ADD COLUMN     "redemptionUrl" TEXT,
ADD COLUMN     "tremendousOrderId" TEXT,
ADD COLUMN     "tremendousRewardId" TEXT;
