-- AlterTable
ALTER TABLE "Evaluacion" ADD COLUMN     "unidadPlanId" INTEGER;

-- AlterTable
ALTER TABLE "TareaMaestra" ADD COLUMN     "unidadPlanId" INTEGER;

-- AddForeignKey
ALTER TABLE "Evaluacion" ADD CONSTRAINT "Evaluacion_unidadPlanId_fkey" FOREIGN KEY ("unidadPlanId") REFERENCES "UnidadPlan"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TareaMaestra" ADD CONSTRAINT "TareaMaestra_unidadPlanId_fkey" FOREIGN KEY ("unidadPlanId") REFERENCES "UnidadPlan"("id") ON DELETE SET NULL ON UPDATE CASCADE;
