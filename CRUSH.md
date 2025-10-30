## Lo que debemos hacer
- La sección "Mis Aportes" para el alumno ya se lista correctamente.

## Tareas Realizadas Recientemente
- **Modal de Asignación de Tareas (`AssignTaskToStudentsModal.js`)**:
    - Se eliminó el botón "Cancelar" duplicado.
    - Se corrigió la lógica de cierre del modal para que la prop `isOpen` sea controlada correctamente por el componente padre.
    - Se añadió un campo de `fechaEntrega` y se incluyó en la llamada a la API.
- **Modal de Asignación de Evaluaciones (`AssignEvaluationToStudentsModal.js`)**:
    - Se implementó la carga de alumnos previamente asignados y la fecha de entrega, para que aparezcan marcados y precargados al reabrir el modal.
    - Se eliminó el botón "Cancelar" duplicado.
    - Se añadió un campo de `fechaEntrega` y se incluyó en la llamada a la API.
    - Se corrigió un error de sintaxis en el `useEffect`.
- **API Frontend (`src/api.js`)**:
    - Se modificó la función `assignEvaluationToAlumnos` para aceptar un objeto de datos (`alumnoIds`, `fecha_entrega`).
    - Se añadió la función `getAssignedEvaluationStudents` para obtener las asignaciones de evaluación existentes.
- **Backend (`composer-backend/routes/docenteRoutes.js`)**:
    - Se ajustó la ruta `POST /docente/catedra/:catedraId/evaluaciones/:evaluationId/assign` para esperar `fecha_entrega` en el cuerpo de la solicitud.
    - Se añadió una nueva ruta `GET /docente/catedra/:catedraId/evaluaciones/:evaluationId/assignments` para obtener los alumnos asignados y la fecha de entrega de una evaluación.
- **Componente `UnidadPlanTable.js`**:
    - Se pasó correctamente la prop `onAssignEvaluation` a `UnidadContentManagement`.

## Plan de Implementación Futura: Conexión de Influencias (Maestro-Alumno)

**Objetivo:** Permitir a los usuarios especificar un "Maestro" para un compositor y visualizar esta conexión en la línea de tiempo.

---

#### **Fase 1: Backend (composer-backend)**

1.  **Modificación del Esquema Prisma (`prisma/schema.prisma`):**
    *   Añadir un nuevo campo `masterId` al modelo `Composer`. Este campo será una relación opcional (`?`) que referencia a otro `Composer` (el maestro).
    *   Ejemplo:
        ```prisma
        model Composer {
          // ... otros campos
          masterId  Int?
          master    Composer? @relation("ComposerInfluence", fields: [masterId], references: [id])
          students  Composer[] @relation("ComposerInfluence")
        }
        ```
2.  **Actualización de Rutas API:**
    *   **`POST /composers` (Crear Compositor):** Modificar la ruta para aceptar un `masterId` opcional en el cuerpo de la solicitud.
    *   **`PUT /composers/:id` (Actualizar Compositor):** Modificar la ruta para permitir actualizar el `masterId` de un compositor existente.
    *   **`GET /composers` (Obtener Compositores):**
        *   Modificar la consulta Prisma para `incluir` la información del `master` (al menos `id`, `first_name`, `last_name`) cuando se solicite. Esto permitirá al frontend conocer el maestro del compositor.
        *   Considerar también incluir una lista de `students` si en el futuro se desea visualizar las influencias en la dirección opuesta.
3.  **Migración de Base de Datos:**
    *   Generar y aplicar una nueva migración de Prisma para añadir el campo `masterId` a la tabla `Composer` en la base de datos.
4.  **Validación:**
    *   Implementar validación en el backend para evitar ciclos de influencia (ej. A -> B y B -> A) y que un compositor no pueda ser su propio maestro.

---

#### **Fase 2: Frontend (composer-frontend)**

1.  **Actualización del Cliente API (`src/api.js`):**
    *   Modificar las funciones `createComposer` y `updateComposer` para aceptar y enviar el `masterId` al backend.
    *   Asegurarse de que la función `getComposers` solicite y reciba la información del `master` cuando esté disponible.
2.  **Modificación de Formularios (`AddComposerForm.js`, `EditSuggestionForm.js`):**
    *   **Campo de Selección de Maestro:** Añadir un nuevo campo al formulario (por ejemplo, un `select` o un componente de autocompletado) que permita al usuario seleccionar un `Composer` existente como `Maestro`.
        *   Este campo debería cargar una lista de compositores disponibles para seleccionar.
        *   Se debe permitir que el campo sea opcional (un compositor puede no tener un maestro registrado).
3.  **Visualización en la Línea de Tiempo (`Timeline.js`):**
    *   **Propagación de Datos:** El componente `Timeline` recibirá ahora los compositores con su `masterId` y la información del `master` relacionada.
    *   **Lógica de Renderizado de Conexiones:**
        *   **Identificación de Conexiones:** Iterar sobre la lista de compositores y, para cada uno que tenga un `masterId`, identificar tanto al compositor "alumno" como al "maestro" en el `groupedTimelineData`.
        *   **Dibujo de Líneas/Cintas:**
            *   Utilizar una biblioteca de grafo como **Cytoscape.js** para dibujar y gestionar las "líneas" o "cintas" entre las tarjetas de los compositores "alumno" y "maestro". Cytoscape.js puede simplificar el manejo de diseños, interactividad y estilización de las conexiones.
            *   Calcular las coordenadas de inicio y fin de la línea basándose en la posición de las tarjetas en el DOM.
            *   Manejar casos en los que el maestro esté en un período diferente o en una posición lejana.
            *   Asegurar que las líneas sean responsivas y se ajusten a los cambios de diseño o expansión/colapso de las tarjetas.
        *   **Resaltado:** Al hacer clic en una línea o en un compositor, se podría resaltar la conexión completa (alumno y maestro).
    *   **Estilización:**
        *   Definir estilos claros y sutiles para las líneas de conexión que no saturen la interfaz pero sean fácilmente visibles (color, grosor, quizás un estilo punteado).

---

#### **Consideraciones Adicionales:**

*   **Compositores no visibles:** ¿Qué ocurre si el maestro no está cargado en la vista actual (debido a filtros o paginación)? Se podría mostrar una indicación de que el maestro existe pero no está visible, o cargar dinámicamente el maestro si es necesario.
*   **Múltiples Maestros/Influencias:** Si en el futuro se desea permitir múltiples influencias, el campo `masterId` debería convertirse en una relación de muchos a muchos (a través de una tabla intermedia) y la interfaz de usuario para la selección y visualización se volvería más compleja.
*   **Rendimiento:** El dibujo de muchas líneas dinámicas puede afectar el rendimiento. Se deberán aplicar optimizaciones si la cantidad de conexiones es muy alta.
*   **UI/UX:** Es crucial que la representación visual sea clara e intuitiva, evitando el desorden.

---

## Tarea Pendiente: Conexión de Tareas y Evaluaciones con el Plan de Clases (Docentes)

**Objetivo:** Conectar las Tareas y Evaluaciones con las Unidades del Plan de Clases para mejorar la organización y trazabilidad.

---

#### **Fase 1: Backend (composer-backend)**

1.  **Modificación del Esquema Prisma (`prisma/schema.prisma`):**
    *   Añadir el campo `unidadPlanId` al modelo `TareaMaestra` y `Evaluacion`.\
    *   Añadir las relaciones inversas `tareas TareaMaestra[]` y `evaluaciones Evaluacion[]` al modelo `UnidadPlan`.
2.  **Migración de Base de Datos:**
    *   Generar y aplicar una nueva migración de Prisma. Si se detecta un drift, se debe ejecutar `npx prisma migrate reset --force` para limpiar la base de datos de desarrollo y luego `npx prisma migrate dev --name <nombre_de_la_migracion>` para aplicar todas las migraciones desde cero.
    *   Comandos útiles para la gestión de la base de datos de desarrollo:
        *   `cd composer-backend && npx prisma migrate reset --force`: Reinicia completamente la base de datos y aplica todas las migraciones. **¡Esto borrará todos los datos!**
        *   `cd composer-backend && npx prisma migrate dev --name <nombre_de_la_migracion>`: Genera una nueva migración si hay cambios en el esquema y la aplica.
        *   `cd composer-backend && node wipe_db.js`: Script para limpiar la base de datos.
        *   `cd composer-backend && node seed_db.js`: Script para cargar datos iniciales en la base de datos.

---

#### **Fase 2: Frontend (composer-frontend) - REESTRUCTURACIÓN**

**Objetivo Revisado:** La gestión de Tareas y Evaluaciones se realizará directamente desde el contexto de una `UnidadPlan` específica, a la que se accede a través de un `PlanDeClases`.

1.  **Actualización del Cliente API (`src/api.js`):**
    *   Modificar las funciones relevantes para Tareas y Evaluaciones para aceptar y enviar el `unidadPlanId` al backend.
    *   Asegurarse de que las funciones para obtener `PlanDeClases` y `UnidadPlan` estén actualizadas (ya realizado: `getDocentePlanesDeClase` y `getUnidadesPlanPorPlan`).

2.  **Modificación de Formularios (`TareaForm.js`, `EvaluationForm.js`):**
    *   Añadir un campo de selección de `PlanDeClases`.
    *   El campo de selección de `UnidadPlan` debe depender del `PlanDeClases` seleccionado, listando solo las unidades correspondientes. (Ya realizado).

3.  **Reestructuración de Vistas en `DocenteCatedraDetailPage.js`:**
    *   **Vista Principal de Cátedra:** Contendrá el "Tablón de Clases", el "Módulo de Gestión de Plan de Clases", el "Módulo de Gestión de Alumnos" y el "Módulo de Gestión de Asistencias".
    *   **Módulo de Gestión de Plan de Clases (`PlanDeClasesTable.js`):**
        *   Listará los `PlanDeClases` de la cátedra.
        *   Por cada `PlanDeClases`, al "Ver Detalles", se accederá a la lista de `UnidadPlan`.
    *   **Dentro de `PlanDeClasesTable.js` (o un nuevo componente de detalles de unidad):**
        *   Cada `UnidadPlan` listada tendrá un botón o acción para **"Gestionar Tareas y Evaluaciones de la Unidad"**.
        *   Al activar esta acción, se mostrará una vista dedicada a las Tareas y Evaluaciones asociadas específicamente a esa `UnidadPlan`. Las secciones de "Tareas del Curso" y "Evaluaciones" (que actualmente están en `DocenteCatedraDetailPage.js`) se moverán a esta vista.

4.  **Actualización de `TaskTable.js` y `EvaluationCard.js` (u otros componentes de listado):**
    *   Adaptar estos componentes para que reciban y muestren datos filtrados por `UnidadPlanId`.
    *   Asegurar que los botones de "Crear Tarea" y "Generar Evaluación" en la nueva ubicación (dentro de la gestión de una `UnidadPlan`) pasen automáticamente el `unidadPlanId` correcto.


---