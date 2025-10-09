/*
  Warnings:

  - You are about to drop the column `horario` on the `Catedra` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Catedra" DROP COLUMN "horario";

-- CreateTable
CREATE TABLE "CatedraDiaHorario" (
    "id" SERIAL NOT NULL,
    "dia_semana" TEXT NOT NULL,
    "hora_inicio" TEXT NOT NULL,
    "hora_fin" TEXT NOT NULL,
    "catedraId" INTEGER NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CatedraDiaHorario_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "CatedraDiaHorario_catedraId_dia_semana_key" ON "CatedraDiaHorario"("catedraId", "dia_semana");

-- AddForeignKey
ALTER TABLE "CatedraDiaHorario" ADD CONSTRAINT "CatedraDiaHorario_catedraId_fkey" FOREIGN KEY ("catedraId") REFERENCES "Catedra"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
