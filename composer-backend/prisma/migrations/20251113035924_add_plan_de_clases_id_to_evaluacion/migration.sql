-- DropForeignKey
ALTER TABLE "Asistencia" DROP CONSTRAINT "Asistencia_alumnoId_fkey";

-- DropForeignKey
ALTER TABLE "CalificacionEvaluacion" DROP CONSTRAINT "CalificacionEvaluacion_alumnoId_fkey";

-- DropForeignKey
ALTER TABLE "CatedraAlumno" DROP CONSTRAINT "CatedraAlumno_alumnoId_fkey";

-- DropForeignKey
ALTER TABLE "ComentarioPublicacion" DROP CONSTRAINT "ComentarioPublicacion_autorAlumnoId_fkey";

-- DropForeignKey
ALTER TABLE "EvaluacionAsignacion" DROP CONSTRAINT "EvaluacionAsignacion_alumnoId_fkey";

-- DropForeignKey
ALTER TABLE "Publicacion" DROP CONSTRAINT "Publicacion_autorAlumnoId_fkey";

-- DropForeignKey
ALTER TABLE "PublicacionInteraccion" DROP CONSTRAINT "PublicacionInteraccion_alumnoId_fkey";

-- DropForeignKey
ALTER TABLE "Puntuacion" DROP CONSTRAINT "Puntuacion_alumnoId_fkey";

-- DropForeignKey
ALTER TABLE "RespuestaAlumno" DROP CONSTRAINT "RespuestaAlumno_alumnoId_fkey";

-- DropForeignKey
ALTER TABLE "TareaAsignacion" DROP CONSTRAINT "TareaAsignacion_alumnoId_fkey";

-- AlterTable
ALTER TABLE "Evaluacion" ADD COLUMN     "planDeClasesId" INTEGER;

-- AddForeignKey
ALTER TABLE "Asistencia" ADD CONSTRAINT "Asistencia_alumnoId_fkey" FOREIGN KEY ("alumnoId") REFERENCES "Alumno"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CalificacionEvaluacion" ADD CONSTRAINT "CalificacionEvaluacion_alumnoId_fkey" FOREIGN KEY ("alumnoId") REFERENCES "Alumno"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CatedraAlumno" ADD CONSTRAINT "CatedraAlumno_alumnoId_fkey" FOREIGN KEY ("alumnoId") REFERENCES "Alumno"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ComentarioPublicacion" ADD CONSTRAINT "ComentarioPublicacion_autorAlumnoId_fkey" FOREIGN KEY ("autorAlumnoId") REFERENCES "Alumno"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Evaluacion" ADD CONSTRAINT "Evaluacion_planDeClasesId_fkey" FOREIGN KEY ("planDeClasesId") REFERENCES "PlanDeClases"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EvaluacionAsignacion" ADD CONSTRAINT "EvaluacionAsignacion_alumnoId_fkey" FOREIGN KEY ("alumnoId") REFERENCES "Alumno"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Publicacion" ADD CONSTRAINT "Publicacion_autorAlumnoId_fkey" FOREIGN KEY ("autorAlumnoId") REFERENCES "Alumno"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PublicacionInteraccion" ADD CONSTRAINT "PublicacionInteraccion_alumnoId_fkey" FOREIGN KEY ("alumnoId") REFERENCES "Alumno"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Puntuacion" ADD CONSTRAINT "Puntuacion_alumnoId_fkey" FOREIGN KEY ("alumnoId") REFERENCES "Alumno"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RespuestaAlumno" ADD CONSTRAINT "RespuestaAlumno_alumnoId_fkey" FOREIGN KEY ("alumnoId") REFERENCES "Alumno"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TareaAsignacion" ADD CONSTRAINT "TareaAsignacion_alumnoId_fkey" FOREIGN KEY ("alumnoId") REFERENCES "Alumno"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
