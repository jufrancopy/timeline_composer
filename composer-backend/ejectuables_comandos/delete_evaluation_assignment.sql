-- Eliminar la CalificacionEvaluacion (si existe) asociada a la EvaluacionAsignacion con ID 36.
-- Esto debe hacerse primero para evitar errores de restricción de clave foránea.
DELETE FROM "CalificacionEvaluacion"
WHERE "evaluacionAsignacionId" = 36;

-- Eliminar las RespuestasAlumno asociadas a las preguntas de la evaluación
-- vinculada a la EvaluacionAsignacion con ID 36.
-- Se requiere un JOIN para encontrar las preguntas correctas.
DELETE FROM "RespuestaAlumno"
WHERE "preguntaId" IN (
    SELECT p.id
    FROM "Pregunta" p
    JOIN "Evaluacion" e ON p."evaluacionId" = e.id
    JOIN "EvaluacionAsignacion" ea ON ea."evaluacionId" = e.id
    WHERE ea.id = 36
);

-- Eliminar la Publicacion (si existe) asociada a la EvaluacionAsignacion con ID 36.
-- Esto debe hacerse antes de eliminar la EvaluacionAsignacion si hay una relación.
DELETE FROM "Publicacion"
WHERE "evaluacionAsignacionId" = 36;

-- Finalmente, eliminar la EvaluacionAsignacion con ID 36.
DELETE FROM "EvaluacionAsignacion"
WHERE id = 36;