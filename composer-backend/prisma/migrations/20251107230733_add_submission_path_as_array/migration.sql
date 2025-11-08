/*
  Warnings:

  - The `submission_path` column on the `TareaAsignacion` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- AlterTable
ALTER TABLE "TareaAsignacion" DROP COLUMN "submission_path",
ADD COLUMN     "submission_path" TEXT[] DEFAULT ARRAY[]::TEXT[];
