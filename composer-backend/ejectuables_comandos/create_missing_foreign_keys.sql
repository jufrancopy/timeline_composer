-- Crear todas las foreign keys de alumnoId que faltan
ALTER TABLE "Asistencia" ADD CONSTRAINT "Asistencia_alumnoId_fkey" FOREIGN KEY ("alumnoId") REFERENCES "Alumno"(id);
ALTER TABLE "CalificacionEvaluacion" ADD CONSTRAINT "CalificacionEvaluacion_alumnoId_fkey" FOREIGN KEY ("alumnoId") REFERENCES "Alumno"(id);
ALTER TABLE "CatedraAlumno" ADD CONSTRAINT "CatedraAlumno_alumnoId_fkey" FOREIGN KEY ("alumnoId") REFERENCES "Alumno"(id);
ALTER TABLE "ComentarioPublicacion" ADD CONSTRAINT "ComentarioPublicacion_autorAlumnoId_fkey" FOREIGN KEY ("autorAlumnoId") REFERENCES "Alumno"(id);
ALTER TABLE "EvaluacionAsignacion" ADD CONSTRAINT "EvaluacionAsignacion_alumnoId_fkey" FOREIGN KEY ("alumnoId") REFERENCES "Alumno"(id);
ALTER TABLE "Publicacion" ADD CONSTRAINT "Publicacion_autorAlumnoId_fkey" FOREIGN KEY ("autorAlumnoId") REFERENCES "Alumno"(id);
ALTER TABLE "PublicacionInteraccion" ADD CONSTRAINT "PublicacionInteraccion_alumnoId_fkey" FOREIGN KEY ("alumnoId") REFERENCES "Alumno"(id);
ALTER TABLE "Puntuacion" ADD CONSTRAINT "Puntuacion_alumnoId_fkey" FOREIGN KEY ("alumnoId") REFERENCES "Alumno"(id);
ALTER TABLE "RespuestaAlumno" ADD CONSTRAINT "RespuestaAlumno_alumnoId_fkey" FOREIGN KEY ("alumnoId") REFERENCES "Alumno"(id);
ALTER TABLE "TareaAsignacion" ADD CONSTRAINT "TareaAsignacion_alumnoId_fkey" FOREIGN KEY ("alumnoId") REFERENCES "Alumno"(id);
