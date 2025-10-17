/*
  Warnings:

  - You are about to drop the column `evaluationId` on the `CalificacionEvaluacion` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[evaluacionAsignacionId]` on the table `CalificacionEvaluacion` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[alumnoId,evaluacionAsignacionId]` on the table `CalificacionEvaluacion` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[evaluacionAsignacionId]` on the table `Publicacion` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[evaluacionMaestraId]` on the table `Publicacion` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `evaluacionAsignacionId` to the `CalificacionEvaluacion` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "EstadoEvaluacionAsignacion" AS ENUM ('PENDIENTE', 'REALIZADA', 'CALIFICADA', 'VENCIDA');

-- AlterEnum
ALTER TYPE "RoleType" ADD VALUE 'ENSEMBLE_ORCHESTRA';

-- DropForeignKey
ALTER TABLE "CalificacionEvaluacion" DROP CONSTRAINT "CalificacionEvaluacion_evaluationId_fkey";

-- DropIndex
DROP INDEX "CalificacionEvaluacion_alumnoId_evaluationId_key";

-- AlterTable
ALTER TABLE "CalificacionEvaluacion" DROP COLUMN "evaluationId",
ADD COLUMN     "evaluacionAsignacionId" INTEGER NOT NULL;

-- AlterTable
ALTER TABLE "Evaluacion" ADD COLUMN     "fecha_limite" TIMESTAMP(3),
ADD COLUMN     "isMaster" BOOLEAN NOT NULL DEFAULT true;

-- AlterTable
ALTER TABLE "Publicacion" ADD COLUMN     "evaluacionAsignacionId" INTEGER,
ADD COLUMN     "evaluacionMaestraId" INTEGER;

-- CreateTable
CREATE TABLE "EvaluacionAsignacion" (
    "id" SERIAL NOT NULL,
    "estado" "EstadoEvaluacionAsignacion" NOT NULL DEFAULT 'PENDIENTE',
    "fecha_entrega" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "alumnoId" INTEGER NOT NULL,
    "evaluacionId" INTEGER NOT NULL,
    "publicacionId" INTEGER,

    CONSTRAINT "EvaluacionAsignacion_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "EvaluacionAsignacion_publicacionId_key" ON "EvaluacionAsignacion"("publicacionId");

-- CreateIndex
CREATE UNIQUE INDEX "EvaluacionAsignacion_alumnoId_evaluacionId_key" ON "EvaluacionAsignacion"("alumnoId", "evaluacionId");

-- CreateIndex
CREATE UNIQUE INDEX "CalificacionEvaluacion_evaluacionAsignacionId_key" ON "CalificacionEvaluacion"("evaluacionAsignacionId");

-- CreateIndex
CREATE UNIQUE INDEX "CalificacionEvaluacion_alumnoId_evaluacionAsignacionId_key" ON "CalificacionEvaluacion"("alumnoId", "evaluacionAsignacionId");

-- CreateIndex
CREATE UNIQUE INDEX "Publicacion_evaluacionAsignacionId_key" ON "Publicacion"("evaluacionAsignacionId");

-- CreateIndex
CREATE UNIQUE INDEX "Publicacion_evaluacionMaestraId_key" ON "Publicacion"("evaluacionMaestraId");

-- AddForeignKey
ALTER TABLE "CalificacionEvaluacion" ADD CONSTRAINT "CalificacionEvaluacion_evaluacionAsignacionId_fkey" FOREIGN KEY ("evaluacionAsignacionId") REFERENCES "EvaluacionAsignacion"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EvaluacionAsignacion" ADD CONSTRAINT "EvaluacionAsignacion_alumnoId_fkey" FOREIGN KEY ("alumnoId") REFERENCES "Alumno"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EvaluacionAsignacion" ADD CONSTRAINT "EvaluacionAsignacion_evaluacionId_fkey" FOREIGN KEY ("evaluacionId") REFERENCES "Evaluacion"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Publicacion" ADD CONSTRAINT "Publicacion_evaluacionAsignacionId_fkey" FOREIGN KEY ("evaluacionAsignacionId") REFERENCES "EvaluacionAsignacion"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Publicacion" ADD CONSTRAINT "Publicacion_evaluacionMaestraId_fkey" FOREIGN KEY ("evaluacionMaestraId") REFERENCES "Evaluacion"("id") ON DELETE SET NULL ON UPDATE CASCADE;
