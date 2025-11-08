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
