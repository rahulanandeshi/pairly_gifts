-- CreateTable
CREATE TABLE "Favorite" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "cardId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Favorite_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Favorite_cardId_idx" ON "Favorite"("cardId");

-- CreateIndex
CREATE UNIQUE INDEX "Favorite_userId_cardId_key" ON "Favorite"("userId", "cardId");

-- AddForeignKey
ALTER TABLE "Favorite" ADD CONSTRAINT "Favorite_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Favorite" ADD CONSTRAINT "Favorite_cardId_fkey" FOREIGN KEY ("cardId") REFERENCES "GreetingCard"("id") ON DELETE CASCADE ON UPDATE CASCADE;
