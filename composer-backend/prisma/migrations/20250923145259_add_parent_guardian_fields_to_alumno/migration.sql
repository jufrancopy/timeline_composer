-- DropIndex
DROP INDEX "CatedraDiaHorario_catedraId_dia_semana_key";

-- AlterTable
ALTER TABLE "Alumno" ADD COLUMN     "nombre_tutor" TEXT,
ADD COLUMN     "telefono_tutor" TEXT,
ADD COLUMN     "vive_con_padres" BOOLEAN DEFAULT false;
