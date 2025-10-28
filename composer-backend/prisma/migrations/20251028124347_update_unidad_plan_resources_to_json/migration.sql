/*
  Warnings:

  - The `recursos` column on the `UnidadPlan` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- AlterEnum
ALTER TYPE "TipoPublicacion" ADD VALUE 'TAREA_ASIGNADA';

-- AlterTable
ALTER TABLE "UnidadPlan" DROP COLUMN "recursos",
ADD COLUMN     "recursos" JSONB[] DEFAULT ARRAY[]::JSONB[];
