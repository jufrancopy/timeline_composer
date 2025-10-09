-- CreateEnum
CREATE TYPE "TipoPago" AS ENUM ('MATRICULA', 'CUOTA', 'OTRO');

-- AlterTable
ALTER TABLE "CatedraAlumno" ADD COLUMN     "fecha_inscripcion" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;

-- CreateTable
CREATE TABLE "CostoCatedra" (
    "id" SERIAL NOT NULL,
    "catedraId" INTEGER NOT NULL,
    "monto_matricula" DOUBLE PRECISION,
    "monto_cuota" DOUBLE PRECISION,
    "es_gratuita" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CostoCatedra_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Pago" (
    "id" SERIAL NOT NULL,
    "catedraAlumnoId" INTEGER NOT NULL,
    "fecha_pago" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "monto_pagado" DOUBLE PRECISION NOT NULL,
    "tipo_pago" "TipoPago" NOT NULL,
    "periodo_cubierto" TEXT,
    "confirmadoPorId" INTEGER,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Pago_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "CostoCatedra_catedraId_key" ON "CostoCatedra"("catedraId");

-- CreateIndex
CREATE UNIQUE INDEX "Pago_catedraAlumnoId_tipo_pago_periodo_cubierto_key" ON "Pago"("catedraAlumnoId", "tipo_pago", "periodo_cubierto");

-- AddForeignKey
ALTER TABLE "CostoCatedra" ADD CONSTRAINT "CostoCatedra_catedraId_fkey" FOREIGN KEY ("catedraId") REFERENCES "Catedra"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Pago" ADD CONSTRAINT "Pago_catedraAlumnoId_fkey" FOREIGN KEY ("catedraAlumnoId") REFERENCES "CatedraAlumno"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Pago" ADD CONSTRAINT "Pago_confirmadoPorId_fkey" FOREIGN KEY ("confirmadoPorId") REFERENCES "Docente"("id") ON DELETE SET NULL ON UPDATE CASCADE;
