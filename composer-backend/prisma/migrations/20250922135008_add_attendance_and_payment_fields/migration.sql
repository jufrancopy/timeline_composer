-- CreateEnum
CREATE TYPE "ModalidadPago" AS ENUM ('PARTICULAR', 'INSTITUCIONAL');

-- AlterTable
ALTER TABLE "Catedra" ADD COLUMN     "modalidad_pago" "ModalidadPago" NOT NULL DEFAULT 'PARTICULAR';

-- AlterTable
ALTER TABLE "CatedraAlumno" ADD COLUMN     "dia_cobro" INTEGER;

-- CreateTable
CREATE TABLE "DiaClase" (
    "id" SERIAL NOT NULL,
    "fecha" TIMESTAMP(3) NOT NULL,
    "dia_semana" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "catedraId" INTEGER NOT NULL,

    CONSTRAINT "DiaClase_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Asistencia" (
    "id" SERIAL NOT NULL,
    "presente" BOOLEAN NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "alumnoId" INTEGER NOT NULL,
    "diaClaseId" INTEGER NOT NULL,

    CONSTRAINT "Asistencia_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Asistencia_alumnoId_diaClaseId_key" ON "Asistencia"("alumnoId", "diaClaseId");

-- AddForeignKey
ALTER TABLE "DiaClase" ADD CONSTRAINT "DiaClase_catedraId_fkey" FOREIGN KEY ("catedraId") REFERENCES "Catedra"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Asistencia" ADD CONSTRAINT "Asistencia_alumnoId_fkey" FOREIGN KEY ("alumnoId") REFERENCES "Alumno"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Asistencia" ADD CONSTRAINT "Asistencia_diaClaseId_fkey" FOREIGN KEY ("diaClaseId") REFERENCES "DiaClase"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
