-- CreateEnum
CREATE TYPE "TipoDiaClase" AS ENUM ('NORMAL', 'FERIADO', 'ASUETO', 'LLUVIA');

-- AlterTable
ALTER TABLE "DiaClase" ADD COLUMN     "tipoDia" "TipoDiaClase" NOT NULL DEFAULT 'NORMAL';
