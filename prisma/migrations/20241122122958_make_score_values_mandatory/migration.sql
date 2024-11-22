/*
  Warnings:

  - Made the column `value` on table `Score` required. This step will fail if there are existing NULL values in that column.
  - Made the column `createdAt` on table `Score` required. This step will fail if there are existing NULL values in that column.
  - Made the column `updatedAt` on table `Score` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "Score" ALTER COLUMN "value" SET NOT NULL,
ALTER COLUMN "createdAt" SET NOT NULL,
ALTER COLUMN "updatedAt" SET NOT NULL;
