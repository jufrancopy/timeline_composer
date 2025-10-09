# Resumen del Esquema de Prisma

El sistema es una plataforma de gestión académica con un enfoque en compositores musicales, que integra aspectos académicos, administrativos y comunitarios.

## Módulos Principales:

### 1. Gestión de Compositores:
- **`Composer`**: Almacena información detallada de compositores (nombre, años, biografía, obras, periodo, roles, etc.).
- **`EditSuggestion`**: Permite sugerir ediciones a los perfiles de compositores, con seguimiento de estado y puntos por contribución.
- **`Comment` y `Rating`**: Funcionalidades para que los usuarios comenten y califiquen a los compositores.
- **`RoleType.STUDENT`**: Indica que los alumnos pueden contribuir con perfiles de compositores.

### 2. Módulo Académico:
- **`Docente` (Profesor)**: Administra `Catedra`s, crea `Publicacion`es, confirma `Pago`s, y elabora `PlanDeClases`.
- **`Alumno` (Estudiante)**: Se inscribe en `Catedra`s, entrega `Tarea`s, realiza `Evaluacion`es, recibe `Puntuacion`es, registra `Asistencia`, y participa en `Publicacion`es. Incluye campos para datos de tutores.
- **`Catedra` (Curso/Clase)**: Define cursos con detalles como nombre, año, institución, horarios, modalidad y costo de pago. Asocia `Docente`s, `Alumno`s, `Evaluacion`es y `TareaMaestra`s.
- **`TareaMaestra` y `TareaAsignacion`**: Define tareas generales que se asignan individualmente a los alumnos, con seguimiento de estado y calificación.
- **`Evaluacion` y `CalificacionEvaluacion`**: Permite a los docentes crear evaluaciones con preguntas y opciones, y registrar las calificaciones.
- **`Asistencia` y `DiaClase`**: Controla la asistencia de los alumnos a los días de clase específicos.
- **`Pago` y `CostoCatedra`**: Gestiona los pagos de matrícula y cuotas, incluyendo la confirmación por un docente.

### 3. Tablón de Anuncios y Interacción Social:
- **`Publicacion`**: Permite crear publicaciones de diversos tipos (ANUNCIO, TAREA, EVALUACION) dentro de una `Catedra`, con autores `Alumno` o `Docente`. Incluye `visibleToStudents`.
- **`ComentarioPublicacion`**: Permite a alumnos y docentes comentar las publicaciones.
- **`PublicacionInteraccion`**: Registra interacciones (ej. "ME_GUSTA") de alumnos y docentes con las publicaciones.

### 4. Plan de Clases:
- **`PlanDeClases` y `UnidadPlan`**: Permite a los docentes organizar planes de clases por mes o módulo, detallando contenido, capacidades, horas, estrategias y recursos.

## Comportamiento General:

El sistema facilita un ecosistema educativo donde los profesores pueden administrar completamente sus clases. Los alumnos participan activamente, siguen su progreso y contribuyen a la base de datos de compositores. Un fuerte componente de comunicación e interacción se da a través del tablón de anuncios, permitiendo tanto anuncios formales como interacciones sociales. El sistema maneja distintos niveles de permisos para `Docente`, `Alumno` y `Composer`/`STUDENT`.
