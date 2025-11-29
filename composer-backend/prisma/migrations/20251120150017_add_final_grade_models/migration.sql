-- CreateTable
CREATE TABLE "CalificacionFinalConfig" (
    "id" SERIAL NOT NULL,
    "titulo" TEXT NOT NULL,
    "catedraId" INTEGER NOT NULL,
    "docenteId" INTEGER NOT NULL,
    "porcentajeMinimoAprobacion" DOUBLE PRECISION NOT NULL DEFAULT 60.0,
    "fechaCreacion" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "elementosConfigurados" JSONB NOT NULL,

    CONSTRAINT "CalificacionFinalConfig_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CalificacionFinalAlumno" (
    "id" SERIAL NOT NULL,
    "calificacionFinalConfigId" INTEGER NOT NULL,
    "alumnoId" INTEGER NOT NULL,
    "notaFinal" DOUBLE PRECISION NOT NULL,
    "fechaCalculo" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "CalificacionFinalAlumno_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "CalificacionFinalAlumno_calificacionFinalConfigId_alumnoId_key" ON "CalificacionFinalAlumno"("calificacionFinalConfigId", "alumnoId");

-- AddForeignKey
ALTER TABLE "CalificacionFinalConfig" ADD CONSTRAINT "CalificacionFinalConfig_catedraId_fkey" FOREIGN KEY ("catedraId") REFERENCES "Catedra"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CalificacionFinalConfig" ADD CONSTRAINT "CalificacionFinalConfig_docenteId_fkey" FOREIGN KEY ("docenteId") REFERENCES "Docente"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CalificacionFinalAlumno" ADD CONSTRAINT "CalificacionFinalAlumno_calificacionFinalConfigId_fkey" FOREIGN KEY ("calificacionFinalConfigId") REFERENCES "CalificacionFinalConfig"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CalificacionFinalAlumno" ADD CONSTRAINT "CalificacionFinalAlumno_alumnoId_fkey" FOREIGN KEY ("alumnoId") REFERENCES "Alumno"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
