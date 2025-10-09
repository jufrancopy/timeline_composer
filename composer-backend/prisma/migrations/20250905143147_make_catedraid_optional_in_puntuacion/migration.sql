/*
  Warnings:

  - A unique constraint covering the columns `[email]` on the table `Otp` will be added. If there are existing duplicate values, this will fail.

*/
-- DropForeignKey
ALTER TABLE "Puntuacion" DROP CONSTRAINT "Puntuacion_catedraId_fkey";

-- AlterTable
ALTER TABLE "Puntuacion" ALTER COLUMN "catedraId" DROP NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "Otp_email_key" ON "Otp"("email");

-- AddForeignKey
ALTER TABLE "Puntuacion" ADD CONSTRAINT "Puntuacion_catedraId_fkey" FOREIGN KEY ("catedraId") REFERENCES "Catedra"("id") ON DELETE SET NULL ON UPDATE CASCADE;
