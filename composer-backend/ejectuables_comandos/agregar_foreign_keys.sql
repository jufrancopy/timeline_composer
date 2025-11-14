-- Script para agregar las Foreign Keys faltantes
-- IMPORTANTE: Ejecuta esto en tu base de datos de desarrollo

-- 1. Asistencia.alumnoId -> Alumno.id
ALTER TABLE "Asistencia" 
ADD CONSTRAINT "Asistencia_alumnoId_fkey" 
FOREIGN KEY ("alumnoId") 
REFERENCES "Alumno"("id") 
ON DELETE RESTRICT ON UPDATE CASCADE;

-- 2. CalificacionEvaluacion.alumnoId -> Alumno.id
ALTER TABLE "CalificacionEvaluacion" 
ADD CONSTRAINT "CalificacionEvaluacion_alumnoId_fkey" 
FOREIGN KEY ("alumnoId") 
REFERENCES "Alumno"("id") 
ON DELETE RESTRICT ON UPDATE CASCADE;

-- 3. CatedraAlumno.alumnoId -> Alumno.id
ALTER TABLE "CatedraAlumno" 
ADD CONSTRAINT "CatedraAlumno_alumnoId_fkey" 
FOREIGN KEY ("alumnoId") 
REFERENCES "Alumno"("id") 
ON DELETE RESTRICT ON UPDATE CASCADE;

-- 4. ComentarioPublicacion.autorAlumnoId -> Alumno.id
ALTER TABLE "ComentarioPublicacion" 
ADD CONSTRAINT "ComentarioPublicacion_autorAlumnoId_fkey" 
FOREIGN KEY ("autorAlumnoId") 
REFERENCES "Alumno"("id") 
ON DELETE SET NULL ON UPDATE CASCADE;

-- 5. EvaluacionAsignacion.alumnoId -> Alumno.id
ALTER TABLE "EvaluacionAsignacion" 
ADD CONSTRAINT "EvaluacionAsignacion_alumnoId_fkey" 
FOREIGN KEY ("alumnoId") 
REFERENCES "Alumno"("id") 
ON DELETE RESTRICT ON UPDATE CASCADE;

-- 6. Publicacion.autorAlumnoId -> Alumno.id
ALTER TABLE "Publicacion" 
ADD CONSTRAINT "Publicacion_autorAlumnoId_fkey" 
FOREIGN KEY ("autorAlumnoId") 
REFERENCES "Alumno"("id") 
ON DELETE SET NULL ON UPDATE CASCADE;

-- 7. PublicacionInteraccion.alumnoId -> Alumno.id
ALTER TABLE "PublicacionInteraccion" 
ADD CONSTRAINT "PublicacionInteraccion_alumnoId_fkey" 
FOREIGN KEY ("alumnoId") 
REFERENCES "Alumno"("id") 
ON DELETE SET NULL ON UPDATE CASCADE;

-- 8. Puntuacion.alumnoId -> Alumno.id
ALTER TABLE "Puntuacion" 
ADD CONSTRAINT "Puntuacion_alumnoId_fkey" 
FOREIGN KEY ("alumnoId") 
REFERENCES "Alumno"("id") 
ON DELETE SET NULL ON UPDATE CASCADE;

-- 9. RespuestaAlumno.alumnoId -> Alumno.id
ALTER TABLE "RespuestaAlumno" 
ADD CONSTRAINT "RespuestaAlumno_alumnoId_fkey" 
FOREIGN KEY ("alumnoId") 
REFERENCES "Alumno"("id") 
ON DELETE RESTRICT ON UPDATE CASCADE;

-- 10. TareaAsignacion.alumnoId -> Alumno.id
ALTER TABLE "TareaAsignacion" 
ADD CONSTRAINT "TareaAsignacion_alumnoId_fkey" 
FOREIGN KEY ("alumnoId") 
REFERENCES "Alumno"("id") 
ON DELETE RESTRICT ON UPDATE CASCADE;

-- Verifica que todas las FKs se crearon correctamente
SELECT 
    tc.table_name, 
    kcu.column_name, 
    ccu.table_name AS foreign_table_name,
    ccu.column_name AS foreign_column_name 
FROM information_schema.table_constraints AS tc 
JOIN information_schema.key_column_usage AS kcu
  ON tc.constraint_name = kcu.constraint_name
  AND tc.table_schema = kcu.table_schema
JOIN information_schema.constraint_column_usage AS ccu
  ON ccu.constraint_name = tc.constraint_name
  AND ccu.table_schema = tc.table_schema
WHERE tc.constraint_type = 'FOREIGN KEY' 
  AND kcu.column_name LIKE '%alumnoId%'
ORDER BY tc.table_name;
