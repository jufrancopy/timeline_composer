/*
  Warnings:

  - You are about to drop the column `photo_url` on the `EditSuggestion` table. All the data in the column will be lost.

*/
-- CreateEnum
CREATE TYPE "public"."TipoOrganizacionPlan" AS ENUM ('MES', 'MODULO');

-- AlterTable
ALTER TABLE "public"."EditSuggestion" DROP COLUMN "photo_url";

-- CreateTable
CREATE TABLE "public"."PlanDeClases" (
    "id" SERIAL NOT NULL,
    "titulo" TEXT NOT NULL,
    "tipoOrganizacion" "public"."TipoOrganizacionPlan" NOT NULL,
    "docenteId" INTEGER NOT NULL,
    "catedraId" INTEGER NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PlanDeClases_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."UnidadPlan" (
    "id" SERIAL NOT NULL,
    "planDeClasesId" INTEGER NOT NULL,
    "periodo" TEXT NOT NULL,
    "contenido" TEXT NOT NULL,
    "capacidades" TEXT NOT NULL,
    "horasTeoricas" INTEGER NOT NULL,
    "horasPracticas" INTEGER NOT NULL,
    "estrategiasMetodologicas" TEXT NOT NULL,
    "mediosVerificacionEvaluacion" TEXT NOT NULL,
    "recursos" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "UnidadPlan_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "public"."PlanDeClases" ADD CONSTRAINT "PlanDeClases_docenteId_fkey" FOREIGN KEY ("docenteId") REFERENCES "public"."Docente"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."PlanDeClases" ADD CONSTRAINT "PlanDeClases_catedraId_fkey" FOREIGN KEY ("catedraId") REFERENCES "public"."Catedra"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."UnidadPlan" ADD CONSTRAINT "UnidadPlan_planDeClasesId_fkey" FOREIGN KEY ("planDeClasesId") REFERENCES "public"."PlanDeClases"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
