/*
  Warnings:

  - You are about to drop the column `evaluacionId` on the `CalificacionEvaluacion` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[alumnoId,evaluationId]` on the table `CalificacionEvaluacion` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `evaluationId` to the `CalificacionEvaluacion` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "CalificacionEvaluacion" DROP CONSTRAINT "CalificacionEvaluacion_evaluacionId_fkey";

-- DropIndex
DROP INDEX "CalificacionEvaluacion_alumnoId_evaluacionId_key";

-- AlterTable
ALTER TABLE "CalificacionEvaluacion" DROP COLUMN "evaluacionId",
ADD COLUMN     "evaluationId" INTEGER NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "CalificacionEvaluacion_alumnoId_evaluationId_key" ON "CalificacionEvaluacion"("alumnoId", "evaluationId");

-- AddForeignKey
ALTER TABLE "CalificacionEvaluacion" ADD CONSTRAINT "CalificacionEvaluacion_evaluationId_fkey" FOREIGN KEY ("evaluationId") REFERENCES "Evaluacion"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
