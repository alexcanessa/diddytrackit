/*
  Warnings:

  - You are about to drop the column `artistId` on the `Band` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[mbid]` on the table `Artist` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[mbid]` on the table `Band` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[mbid]` on the table `Label` will be added. If there are existing duplicate values, this will fail.

*/
-- DropForeignKey
ALTER TABLE "Band" DROP CONSTRAINT "Band_artistId_fkey";

-- DropForeignKey
ALTER TABLE "Label" DROP CONSTRAINT "Label_artistId_fkey";

-- AlterTable
ALTER TABLE "Artist" ADD COLUMN     "mbType" TEXT,
ADD COLUMN     "mbid" TEXT,
ALTER COLUMN "reason" DROP NOT NULL;

-- AlterTable
ALTER TABLE "Band" DROP COLUMN "artistId",
ADD COLUMN     "mbType" TEXT,
ADD COLUMN     "mbid" TEXT;

-- AlterTable
ALTER TABLE "Label" ADD COLUMN     "mbType" TEXT,
ADD COLUMN     "mbid" TEXT,
ALTER COLUMN "artistId" DROP NOT NULL;

-- CreateTable
CREATE TABLE "Score" (
    "id" SERIAL NOT NULL,
    "role" TEXT NOT NULL,
    "value" INTEGER NOT NULL,
    "artistId" INTEGER,
    "labelId" INTEGER,
    "bandId" INTEGER,

    CONSTRAINT "Score_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "_ArtistBands" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "_ArtistBands_AB_unique" ON "_ArtistBands"("A", "B");

-- CreateIndex
CREATE INDEX "_ArtistBands_B_index" ON "_ArtistBands"("B");

-- CreateIndex
CREATE UNIQUE INDEX "Artist_mbid_key" ON "Artist"("mbid");

-- CreateIndex
CREATE UNIQUE INDEX "Band_mbid_key" ON "Band"("mbid");

-- CreateIndex
CREATE UNIQUE INDEX "Label_mbid_key" ON "Label"("mbid");

-- AddForeignKey
ALTER TABLE "Label" ADD CONSTRAINT "Label_artistId_fkey" FOREIGN KEY ("artistId") REFERENCES "Artist"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Score" ADD CONSTRAINT "Score_artistId_fkey" FOREIGN KEY ("artistId") REFERENCES "Artist"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Score" ADD CONSTRAINT "Score_labelId_fkey" FOREIGN KEY ("labelId") REFERENCES "Label"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Score" ADD CONSTRAINT "Score_bandId_fkey" FOREIGN KEY ("bandId") REFERENCES "Band"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_ArtistBands" ADD CONSTRAINT "_ArtistBands_A_fkey" FOREIGN KEY ("A") REFERENCES "Artist"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_ArtistBands" ADD CONSTRAINT "_ArtistBands_B_fkey" FOREIGN KEY ("B") REFERENCES "Band"("id") ON DELETE CASCADE ON UPDATE CASCADE;
