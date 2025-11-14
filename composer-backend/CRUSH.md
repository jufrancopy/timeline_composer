### Permitir Subida Múltiple de Archivos en el Frontend para Tareas

**Problema:**
El backend ya está configurado para aceptar múltiples archivos en la entrega de tareas (`/api/tareas/:tareaAsignacionId/submit`), pero la interfaz de usuario del frontend solo permite seleccionar un archivo a la vez.

**Solución:**
Necesitas modificar el componente de subida de archivos en el frontend para permitir la selección de múltiples archivos y ajustar la lógica para manejar una lista de archivos.

**Pasos a Seguir en el Frontend:**

1.  **Localizar el Input de Archivo:**
    *   En tu código HTML, JSX o el componente de tu framework (React, Vue, Angular), busca el elemento `<input type="file">` que se utiliza para la entrega de tareas.

2.  **Añadir el Atributo `multiple`:**
    *   Añade el atributo `multiple` al elemento `<input type="file">`. Por ejemplo:
        ```html
        <input type="file" multiple />
        ```
    *   Esto permitirá al usuario seleccionar varios archivos en el diálogo del explorador de archivos.

3.  **Ajustar la Lógica de JavaScript/TypeScript:**
    *   Cuando el usuario seleccione archivos, el evento `change` del input devolverá un objeto `FileList` (no un `File` singular).
    *   Modifica tu manejador de eventos para iterar sobre `event.target.files` (que será un array-like de `File` objetos) y adjuntar cada archivo a tu `FormData` de la siguiente manera:
        ```javascript
        const handleFileChange = (event) => {
          const files = event.target.files;
          const formData = new FormData();
          for (let i = 0; i < files.length; i++) {
            formData.append('file', files[i]); // 'file' es el nombre del campo esperado por Multer en el backend
          }
          // Luego, envía formData al backend
        };
        ```
    *   Asegúrate de que la clave utilizada en `formData.append()` (`'file'` en el ejemplo) coincida con el nombre del campo que Multer espera en el backend (que es `'file'` en `multerConfig.js` para `uploadSingle` y `uploadArray`).

**Nota Importante:** El backend (`composer-backend/index.js` y `composer-backend/utils/multerConfig.js`) ya está configurado para manejar múltiples archivos. Los cambios necesarios son exclusivamente en el frontend.

### Problema de `unidadContent` Vacío en la Generación de Evaluaciones (Frontend)

**Problema:**
Al intentar generar una evaluación, especialmente cuando se selecciona la opción "Generar preguntas para todas las Unidades de este Plan", el campo "Contenido de la Unidad Seleccionada" en el formulario del frontend se vacía y se envía un `unidadContent` vacío al backend. Esto provoca que la generación de preguntas falle o sea incorrecta.

**Causa Detectada:**
El JavaScript del frontend parece estar limpiando o reestableciendo el valor del `unidadContent` justo antes de enviar la solicitud POST al backend.

**Solución Propuesta (en el Frontend):**

1.  **Identificar el Componente Afectado:**
    *   Revisar el componente de React (o el framework JS utilizado) que maneja el formulario de generación de evaluaciones, específicamente donde se encuentra el botón "Generar Evaluación" y el checkbox "Generar preguntas para todas las Unidades de este Plan". Probablemente sea `EvaluationForm.js` o `UnidadContentManagement.js` según los logs.

2.  **Revisar la Lógica del Checkbox "Generar preguntas para todas las Unidades de este Plan":**
    *   Asegurarse de que cuando este checkbox está activado, la lógica del frontend:
        *   Recopile el contenido de *todas* las unidades relevantes.
        *   Almacene este contenido de manera persistente en el estado del componente.
        *   Cuando el `unidadId` es 'all', el `unidadContent` no debe ser un string vacío.

3.  **Depurar el Manejador del `onSubmit` del Formulario:**
    *   Colocar un `console.log()` o un breakpoint en la función que se ejecuta al hacer clic en "Generar Evaluación" (justo antes de la llamada `axios.post` o `fetch`).
    *   Inspeccionar el objeto de datos (payload) que se va a enviar al backend.
    *   Verificar que la propiedad `unidadContent` dentro de este payload contenga el contenido esperado y no esté vacía.

4.  **Asegurar la Persistencia del `unidadContent`:**
    *   Si el contenido se está vaciando, revisar si hay alguna llamada a `setState` o alguna reasignación de variable que esté reiniciando `unidadContent` en un momento inoportuno.
    *   La lógica debe asegurar que el `unidadContent` se construya y se mantenga correctamente en el estado del componente antes de ser enviado. Si `unidadId` es 'all', el `unidadContent` debe ser una concatenación o un resumen de todas las unidades, no un string vacío.

**Nota Importante:** El backend (`composer-backend/routes/docenteRoutes.js`) espera recibir el `unidadContent` para poder generar las preguntas. Los cambios necesarios son exclusivamente en el frontend para asegurar que este campo se envíe correctamente.