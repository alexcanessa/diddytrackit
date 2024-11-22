/*
  Warnings:

  - You are about to drop the column `artistId` on the `Score` table. All the data in the column will be lost.
  - You are about to drop the column `bandId` on the `Score` table. All the data in the column will be lost.
  - You are about to drop the column `labelId` on the `Score` table. All the data in the column will be lost.
  - You are about to drop the column `role` on the `Score` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "Score" DROP CONSTRAINT "Score_artistId_fkey";

-- DropForeignKey
ALTER TABLE "Score" DROP CONSTRAINT "Score_bandId_fkey";

-- DropForeignKey
ALTER TABLE "Score" DROP CONSTRAINT "Score_labelId_fkey";

-- AlterTable
ALTER TABLE "Score" DROP COLUMN "artistId",
DROP COLUMN "bandId",
DROP COLUMN "labelId",
DROP COLUMN "role",
ADD COLUMN     "createdAt" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "type" TEXT,
ADD COLUMN     "updatedAt" TIMESTAMP(3),
ALTER COLUMN "value" DROP NOT NULL;
