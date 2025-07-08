/*
  Warnings:

  - You are about to drop the column `author` on the `Comment` table. All the data in the column will be lost.
  - You are about to drop the column `createdAt` on the `Comment` table. All the data in the column will be lost.
  - You are about to drop the column `approved` on the `Composer` table. All the data in the column will be lost.
  - You are about to drop the column `birthDate` on the `Composer` table. All the data in the column will be lost.
  - You are about to drop the column `deathDate` on the `Composer` table. All the data in the column will be lost.
  - You are about to drop the column `ipAddress` on the `Composer` table. All the data in the column will be lost.
  - You are about to drop the column `mainRole` on the `Composer` table. All the data in the column will be lost.
  - You are about to drop the column `name` on the `Composer` table. All the data in the column will be lost.
  - You are about to drop the column `photoUrl` on the `Composer` table. All the data in the column will be lost.
  - You are about to drop the column `youtubeLink` on the `Composer` table. All the data in the column will be lost.
  - Added the required column `name` to the `Comment` table without a default value. This is not possible if the table is not empty.
  - Added the required column `bio` to the `Composer` table without a default value. This is not possible if the table is not empty.
  - Added the required column `birth_year` to the `Composer` table without a default value. This is not possible if the table is not empty.
  - Added the required column `email` to the `Composer` table without a default value. This is not possible if the table is not empty.
  - Added the required column `first_name` to the `Composer` table without a default value. This is not possible if the table is not empty.
  - Added the required column `last_name` to the `Composer` table without a default value. This is not possible if the table is not empty.
  - Added the required column `notable_works` to the `Composer` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updated_at` to the `Composer` table without a default value. This is not possible if the table is not empty.
  - Added the required column `period` to the `Composer` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Comment" DROP COLUMN "author",
DROP COLUMN "createdAt",
ADD COLUMN     "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "ip_address" TEXT,
ADD COLUMN     "name" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "Composer" DROP COLUMN "approved",
DROP COLUMN "birthDate",
DROP COLUMN "deathDate",
DROP COLUMN "ipAddress",
DROP COLUMN "mainRole",
DROP COLUMN "name",
DROP COLUMN "photoUrl",
DROP COLUMN "youtubeLink",
ADD COLUMN     "bio" TEXT NOT NULL,
ADD COLUMN     "birth_day" INTEGER,
ADD COLUMN     "birth_month" INTEGER,
ADD COLUMN     "birth_year" INTEGER NOT NULL,
ADD COLUMN     "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "death_day" INTEGER,
ADD COLUMN     "death_month" INTEGER,
ADD COLUMN     "death_year" INTEGER,
ADD COLUMN     "email" TEXT NOT NULL,
ADD COLUMN     "first_name" TEXT NOT NULL,
ADD COLUMN     "ip_address" TEXT,
ADD COLUMN     "last_name" TEXT NOT NULL,
ADD COLUMN     "notable_works" TEXT NOT NULL,
ADD COLUMN     "photo_url" TEXT,
ADD COLUMN     "quality" TEXT,
ADD COLUMN     "references" TEXT,
ADD COLUMN     "status" TEXT NOT NULL DEFAULT 'PENDING_REVIEW',
ADD COLUMN     "updated_at" TIMESTAMP(3) NOT NULL,
ADD COLUMN     "youtube_link" TEXT,
DROP COLUMN "period",
ADD COLUMN     "period" TEXT NOT NULL;

-- DropEnum
DROP TYPE "Period";

-- DropEnum
DROP TYPE "Role";

-- CreateTable
CREATE TABLE "Rating" (
    "id" SERIAL NOT NULL,
    "rating_value" INTEGER NOT NULL,
    "ip_address" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "composerId" INTEGER NOT NULL,

    CONSTRAINT "Rating_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Otp" (
    "id" SERIAL NOT NULL,
    "email" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Otp_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Rating_composerId_ip_address_key" ON "Rating"("composerId", "ip_address");

-- AddForeignKey
ALTER TABLE "Rating" ADD CONSTRAINT "Rating_composerId_fkey" FOREIGN KEY ("composerId") REFERENCES "Composer"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
