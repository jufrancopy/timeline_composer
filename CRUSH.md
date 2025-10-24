## Lo que debemos hacer
- La sección "Mis Aportes" para el alumno ya se lista correctamente.

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