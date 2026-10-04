/*
  Warnings:

  - You are about to drop the column `accessory` on the `UserAvatar` table. All the data in the column will be lost.
  - You are about to drop the column `animation` on the `UserAvatar` table. All the data in the column will be lost.
  - You are about to drop the column `hair` on the `UserAvatar` table. All the data in the column will be lost.
  - You are about to drop the column `hairColor` on the `UserAvatar` table. All the data in the column will be lost.
  - You are about to drop the column `outfit` on the `UserAvatar` table. All the data in the column will be lost.
  - You are about to drop the column `skinTone` on the `UserAvatar` table. All the data in the column will be lost.
  - Added the required column `config` to the `UserAvatar` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "UserAvatar" DROP COLUMN "accessory",
DROP COLUMN "animation",
DROP COLUMN "hair",
DROP COLUMN "hairColor",
DROP COLUMN "outfit",
DROP COLUMN "skinTone",
ADD COLUMN     "config" JSONB NOT NULL;
