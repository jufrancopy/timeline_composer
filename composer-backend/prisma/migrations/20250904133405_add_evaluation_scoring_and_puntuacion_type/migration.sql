/*
  Warnings:

  - Added the required column `catedraId` to the `Puntuacion` table without a default value. This is not possible if the table is not empty.
  - Added the required column `tipo` to the `Puntuacion` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "TipoPuntuacion" AS ENUM ('TAREA', 'EVALUACION', 'APORTE');

-- AlterTable
ALTER TABLE "Puntuacion" ADD COLUMN     "catedraId" INTEGER NOT NULL,
ADD COLUMN     "tipo" "TipoPuntuacion" NOT NULL;

-- CreateTable
CREATE TABLE "CalificacionEvaluacion" (
    "id" SERIAL NOT NULL,
    "puntos" INTEGER NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "alumnoId" INTEGER NOT NULL,
    "evaluacionId" INTEGER NOT NULL,

    CONSTRAINT "CalificacionEvaluacion_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "CalificacionEvaluacion_alumnoId_evaluacionId_key" ON "CalificacionEvaluacion"("alumnoId", "evaluacionId");

-- AddForeignKey
ALTER TABLE "Puntuacion" ADD CONSTRAINT "Puntuacion_catedraId_fkey" FOREIGN KEY ("catedraId") REFERENCES "Catedra"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CalificacionEvaluacion" ADD CONSTRAINT "CalificacionEvaluacion_alumnoId_fkey" FOREIGN KEY ("alumnoId") REFERENCES "Alumno"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CalificacionEvaluacion" ADD CONSTRAINT "CalificacionEvaluacion_evaluacionId_fkey" FOREIGN KEY ("evaluacionId") REFERENCES "Evaluacion"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
