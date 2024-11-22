/*
  Warnings:

  - You are about to drop the column `mbType` on the `Artist` table. All the data in the column will be lost.
  - You are about to drop the column `mbType` on the `Band` table. All the data in the column will be lost.
  - You are about to drop the column `mbType` on the `Label` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Artist" DROP COLUMN "mbType";

-- AlterTable
ALTER TABLE "Band" DROP COLUMN "mbType";

-- AlterTable
ALTER TABLE "Label" DROP COLUMN "mbType";
