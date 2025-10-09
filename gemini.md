## Problema Actual

Actualmente, el sistema no tiene un flujo claro para la gestión y asignación de evaluaciones a los alumnos. Las evaluaciones no siguen la misma lógica de "maestra" y "asignación" que las tareas, lo que lleva a las siguientes deficiencias:

- **Falta de Evaluación Maestra**: No existe un concepto de "Evaluación Maestra" que permita a los docentes crear plantillas de evaluaciones reutilizables.
- **Visibilidad Incontrolada**: Las evaluaciones creadas por el docente pueden ser visibles para los alumnos de manera prematura o sin un control adecuado.
- **Ausencia de Asignación Dirigida**: No hay un mecanismo para que el docente asigne una evaluación específica a uno o varios alumnos.
- **Falta de Notificación**: Los alumnos no son notificados cuando se les asigna una evaluación.
- **Duplicación o Confusión en el Tablón del Alumno**: Las evaluaciones podrían aparecer duplicadas o de forma confusa si no se gestiona correctamente la visibilidad en el tablón.
- **Redirección Inexistente**: No hay un enlace directo desde el tablón de anuncios del alumno a la sección específica de "Mis Evaluaciones" para una evaluación asignada.
- **Estado de Evaluación No Visible**: El alumno no puede ver el estado de una evaluación (e.g., "Pendiente", "Realizada", "Calificada") directamente en el tablón.

## Objetivo

Implementar la lógica completa para la gestión y asignación de evaluaciones en el sistema, siguiendo el modelo de `TareaMaestra` y `TareaAsignacion`, asegurando:

1.  **Creación de Evaluación Maestra**: Permitir al docente crear una "Evaluación Maestra" que sirva como plantilla.
2.  **Visibilidad Controlada**: La Evaluación Maestra, al ser creada, se publica en el tablón del docente, pero *no* es visible para los alumnos hasta que sea asignada.
3.  **Asignación de Evaluaciones**: Los docentes deben poder asignar una Evaluación Maestra a alumnos específicos o a todos los alumnos de una cátedra.
4.  **Notificación por Correo Electrónico**: Al asignar una Evaluación Maestra, se debe notificar a los alumnos asignados vía correo electrónico.
5.  **Tablón del Alumno (Publicaciones)**:
    *   Solo se muestran las Evaluaciones Maestras que han sido asignadas al alumno.
    *   Permitir interacciones (me gusta) y comentarios para estas Evaluaciones Maestras asignadas.
    *   Incluir una URL/enlace que dirija al alumno a la pestaña "Mis Evaluaciones" para esa Evaluación Maestra específica (e.g., `/alumno/evaluaciones/:evaluacionId`).
    *   Mostrar el estado de la `Evaluacion` (e.g., "Pendiente", "Realizada", "Calificada") para el alumno en el tablón.

## Plan de Acción

1.  **Revisar Schema de Prisma (`prisma/schema.prisma`)**:
    *   Asegurar que el modelo `Evaluacion` pueda funcionar como `EvaluacionMaestra` y que exista un modelo para `EvaluacionAsignacion` (o similar) que vincule una `EvaluacionMaestra` con un `Alumno`, registrando el estado, fecha de entrega, etc.
    *   Verificar que `Publicacion` pueda relacionarse con `Evaluacion` y tenga campos de control de visibilidad (`visibleToStudents`) y tipo (`EVALUACION`).

2.  **Backend (`publicacionRoutes.js`, `docenteRoutes.js`, `alumnoRoutes.js`, `evaluationRoutes.js`, `ai.js` para emails)**:
    *   **Creación de Evaluación Maestra (`evaluationRoutes.js`)**:
        *   Modificar la ruta de creación de evaluaciones para que, al crear una `EvaluacionMaestra`, si se genera una `Publicacion` automáticamente, esta inicialmente NO sea visible para los alumnos (`visibleToStudents: false`).
        *   Asegurar que la `Evaluacion` se relacione correctamente con `Catedra` y `Docente`.
    *   **Asignación de Evaluaciones (`docenteRoutes.js` o nueva `evaluationAssignmentRoutes.js`)**:
        *   Crear una nueva ruta que permita al docente asignar una `EvaluacionMaestra` a alumnos específicos o a todos los alumnos de una cátedra.
        *   Esta acción debe:
            *   Crear entradas en el nuevo modelo `EvaluacionAsignacion` para cada alumno, vinculando la `EvaluacionMaestra` con el alumno.
            *   Actualizar la `Publicacion` asociada a la `EvaluacionMaestra` para `visibleToStudents: true` para los alumnos asignados.
            *   Disparar el envío de correos electrónicos de notificación a los alumnos asignados (utilizando `ai.js`).
    *   **Tablón del Alumno (API en `publicacionRoutes.js`)**: Modificar la ruta que obtiene las publicaciones para los alumnos para que solo retorne `Publicacion`es de tipo `EVALUACION` que sean `visibleToStudents: true` y estén específicamente asignadas al alumno que realiza la solicitud (a través del modelo `EvaluacionAsignacion`).
    *   **Estado de Evaluación (`publicacionRoutes.js` y `evaluationRoutes.js`)**: La API debe ser capaz de buscar el estado de la `EvaluacionAsignacion` correspondiente para el alumno y adjuntarlo a la `Publicacion` antes de enviarlo al frontend.

3.  **Frontend (`MyContributionsPage.js`, `PublicacionCard.js`, `EvaluationCard.js`, `EvaluationTable.js`, `DocenteGenerateEvaluationPage.js`, `RealizarEvaluacionPage.js`)**:
    *   **`MyContributionsPage.js`**:
        *   Asegurar que solo se rendericen las `Publicacion`es de tipo `EVALUACION` que cumplen la nueva lógica de visibilidad para el alumno.
        *   Pasar la información de `EvaluacionMaestra` y su estado (`isCompleted`, `status`, etc.) a `PublicacionCard.js` cuando corresponda.
    *   **`PublicacionCard.js`**:
        *   Modificar para mostrar el estado de la `Evaluacion` (si está disponible y asignada al alumno).
        *   Añadir la lógica para renderizar una URL/botón que dirija a "Mis Evaluaciones" (e.g., `/alumno/evaluaciones/:evaluacionId`).
        *   Asegurar que las interacciones y comentarios funcionen correctamente para `Publicacion`es de tipo `EVALUACION` asignadas.
    *   **Componentes de Evaluación (`EvaluationCard.js`, `EvaluationTable.js`)**:
        *   Revisar estos componentes para asegurarse de que solo muestren las evaluaciones asignadas específicamente al alumno y que no dupliquen la información mostrada en el tablón.
    *   **`DocenteGenerateEvaluationPage.js`**: Adaptar para la creación de `EvaluacionMaestra`.
    *   **`RealizarEvaluacionPage.js`**: Asegurar que esta página maneje la realización de `EvaluacionAsignacion` y actualice su estado.

Este plan permitirá un control granular sobre la creación, asignación y visibilidad de las evaluaciones, mejorando la experiencia tanto para docentes como para alumnos.

## Cambios Realizados

### 1. Frontend (`composer-frontend/src/api.js`)

*   **Corrección de `TypeError`**: Se añadió la función `getDocenteEvaluacionesMaestras(catedraId)` al objeto `api`. Esta función es utilizada por el `AssignEvaluationForm.js` para obtener las evaluaciones maestras disponibles para una cátedra.
*   **Refactorización del Manejo de Tokens**: Se eliminó la inclusión manual del encabezado `Authorization` en la mayoría de las funciones de la API (`getDocenteCatedras`, `getDocenteCatedra`, `getDocenteTareasMaestras`, `getTareaMaestraById`, `getDocenteEvaluacionesMaestras`, `createDiaClase`, `getDiasClase`, `updateDiaClase`, `deleteDiaClase`, `getAttendanceByDiaClase`, `registerAttendance`, `updateAttendance`, `getDocenteAlumnoPagos`, `registerDocentePago`, `createTareaForDocenteCatedra`, `updateTareaForDocente`, `deleteTareaForDocente`, `generateDocenteEvaluation`, `getEvaluationById`, `deleteEvaluation`, `createPlanDeClases`, `getPlanesDeClaseForCatedra`, `getPlanDeClases`, `updatePlanDeClases`, `deletePlanDeClases`, `desinscribirAlumnoForDocente`, `assignTareaToAlumnos`, `getEntregasForAlumno`, `getEvaluacionesForAlumno`, `getEvaluationResults`, `calificarTarea`, `getComposers`, `getStudentEvaluations`, `getEvaluationForStudent`, `submitEvaluation`, `getEvaluationResultsForStudent`, `getMyEvaluations` (ambas), `getPublicacionesForAlumno`, `createPublicacion`, `updatePublicacion`, `deletePublicacion`, `togglePublicacionVisibility`, `createComentario`, `deleteComentario`, `interactWithPublicacion`, `uninteractWithPublicacion`, `submitTaskDelivery`). Ahora, estas funciones dependen del interceptor de `axios` (`apiClient.interceptors.request.use`) para adjuntar automáticamente el token de autenticación (`docenteToken`, `adminToken`, `userToken`) según la prioridad. Esto centraliza la gestión de tokens y ayuda a prevenir errores 401 y 403.

### 2. Backend (`composer-backend/docenteRoutes.js`)

*   **Nueva Ruta: `GET /docentes/catedras/:catedraId/evaluaciones-maestras`**: Se implementó esta ruta para permitir a los docentes obtener una lista de todas las evaluaciones (`Evaluacion`) que han creado para una cátedra específica. La ruta incluye una verificación de que la cátedra pertenece al docente autenticado y devuelve las evaluaciones con un conteo de sus preguntas.

### Próximos Pasos (Pendientes)

1.  **Backend - Asignación de Evaluaciones**: Crear una nueva ruta POST en `docenteRoutes.js` para asignar una `EvaluacionMaestra` a alumnos específicos. Esta ruta debe:
    *   Verificar la evaluación y permisos del docente.
    *   Crear entradas en el modelo `EvaluacionAsignacion` para cada alumno, incluyendo el `estado` y `fecha_limite`.
    *   Actualizar la `Publicacion` asociada a la `EvaluacionMaestra` para que sea `visibleToStudents: true` para los alumnos asignados.
    *   Enviar correos electrónicos de notificación a los alumnos asignados.

2.  **Frontend - Componente de Asignación**: Asegurar que el `AssignEvaluationForm.js` utilice la nueva función `assignEvaluationToAlumnos` una vez que esté implementada en el backend.

3.  **Frontend - Tablón del Alumno**: Modificar la lógica para mostrar solo las `Publicacion`es de tipo `EVALUACION` que estén específicamente asignadas al alumno y mostrar el estado de la `EvaluacionAsignacion`.