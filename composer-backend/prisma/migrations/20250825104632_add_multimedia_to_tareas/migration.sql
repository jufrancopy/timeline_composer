-- AlterTable
ALTER TABLE "Tarea" ADD COLUMN     "multimedia_path" TEXT,
ADD COLUMN     "recursos" TEXT[] DEFAULT ARRAY[]::TEXT[];
