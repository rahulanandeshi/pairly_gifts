-- CreateEnum
CREATE TYPE "DeliveryChannel" AS ENUM ('EMAIL', 'SMS', 'LINK');

-- AlterTable
ALTER TABLE "GreetingCard" ADD COLUMN     "rejectionReason" TEXT;

-- AlterTable
ALTER TABLE "SentGreeting" ADD COLUMN     "deliveryChannel" "DeliveryChannel" NOT NULL DEFAULT 'EMAIL',
ADD COLUMN     "recipientPhone" TEXT;
