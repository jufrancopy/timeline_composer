-- Script para verificar la integridad de datos ANTES de agregar Foreign Keys
-- Si alguna consulta devuelve filas, hay datos huérfanos que deben limpiarse primero

-- 1. Verificar Asistencia
SELECT 'Asistencia' as tabla, COUNT(*) as registros_huerfanos
FROM "Asistencia" t
LEFT JOIN "Alumno" a ON t."alumnoId" = a.id
WHERE a.id IS NULL AND t."alumnoId" IS NOT NULL;

-- 2. Verificar CalificacionEvaluacion
SELECT 'CalificacionEvaluacion' as tabla, COUNT(*) as registros_huerfanos
FROM "CalificacionEvaluacion" t
LEFT JOIN "Alumno" a ON t."alumnoId" = a.id
WHERE a.id IS NULL AND t."alumnoId" IS NOT NULL;

-- 3. Verificar CatedraAlumno
SELECT 'CatedraAlumno' as tabla, COUNT(*) as registros_huerfanos
FROM "CatedraAlumno" t
LEFT JOIN "Alumno" a ON t."alumnoId" = a.id
WHERE a.id IS NULL AND t."alumnoId" IS NOT NULL;

-- 4. Verificar ComentarioPublicacion
SELECT 'ComentarioPublicacion' as tabla, COUNT(*) as registros_huerfanos
FROM "ComentarioPublicacion" t
LEFT JOIN "Alumno" a ON t."autorAlumnoId" = a.id
WHERE a.id IS NULL AND t."autorAlumnoId" IS NOT NULL;

-- 5. Verificar EvaluacionAsignacion
SELECT 'EvaluacionAsignacion' as tabla, COUNT(*) as registros_huerfanos
FROM "EvaluacionAsignacion" t
LEFT JOIN "Alumno" a ON t."alumnoId" = a.id
WHERE a.id IS NULL AND t."alumnoId" IS NOT NULL;

-- 6. Verificar Publicacion
SELECT 'Publicacion' as tabla, COUNT(*) as registros_huerfanos
FROM "Publicacion" t
LEFT JOIN "Alumno" a ON t."autorAlumnoId" = a.id
WHERE a.id IS NULL AND t."autorAlumnoId" IS NOT NULL;

-- 7. Verificar PublicacionInteraccion
SELECT 'PublicacionInteraccion' as tabla, COUNT(*) as registros_huerfanos
FROM "PublicacionInteraccion" t
LEFT JOIN "Alumno" a ON t."alumnoId" = a.id
WHERE a.id IS NULL AND t."alumnoId" IS NOT NULL;

-- 8. Verificar Puntuacion
SELECT 'Puntuacion' as tabla, COUNT(*) as registros_huerfanos
FROM "Puntuacion" t
LEFT JOIN "Alumno" a ON t."alumnoId" = a.id
WHERE a.id IS NULL AND t."alumnoId" IS NOT NULL;

-- 9. Verificar RespuestaAlumno
SELECT 'RespuestaAlumno' as tabla, COUNT(*) as registros_huerfanos
FROM "RespuestaAlumno" t
LEFT JOIN "Alumno" a ON t."alumnoId" = a.id
WHERE a.id IS NULL AND t."alumnoId" IS NOT NULL;

-- 10. Verificar TareaAsignacion
SELECT 'TareaAsignacion' as tabla, COUNT(*) as registros_huerfanos
FROM "TareaAsignacion" t
LEFT JOIN "Alumno" a ON t."alumnoId" = a.id
WHERE a.id IS NULL AND t."alumnoId" IS NOT NULL;

-- RESUMEN: Si TODAS las consultas devuelven 0, es seguro agregar las FKs
