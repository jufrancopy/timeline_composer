# TimeLine Composer v1.0

> Una línea de tiempo interactiva y colaborativa de los grandes compositores y poetas de la música paraguaya.

Este proyecto es una plataforma web dedicada a construir y visualizar la historia de la música en Paraguay. Permite a los usuarios contribuir con información sobre compositores y letristas, que luego es revisada y curada por administradores para garantizar la calidad y precisión de los datos.

![Separador](https://via.placeholder.com/1200x2/4a5568/4a5568)

## 🚀 Funcionalidades Principales

- **Línea de Tiempo Interactiva:** Visualiza a los compositores por período histórico.
- **Aportes de la Comunidad:** Cualquier usuario puede sugerir un nuevo compositor o poeta a través de un formulario detallado.
- **Sistema de Curación:** Un panel de administración permite revisar, aprobar o rechazar los aportes, con la posibilidad de enviar feedback a los usuarios.
- **Corrección de Aportes:** Los usuarios pueden ver el estado de sus aportes y corregirlos según las sugerencias del curador.
- **Gamificación:** Se asigna un puntaje a cada aporte y se muestra un ranking para incentivar la participación y la calidad de los datos.
- **Efemérides y Compositor Destacado:** Secciones dinámicas en la página principal para mantener el interés.

## 🛠️ Stack Tecnológico

El proyecto está dividido en dos componentes principales:

- **Backend (`composer-backend`):**
  - **Entorno:** Node.js
  - **Framework:** Express.js
  - **ORM:** Prisma
  - **Base de Datos:** SQLite (para facilidad de despliegue y desarrollo)

- **Frontend (`composer-frontend`):**
  - **Librería:** React
  - **Enrutamiento:** React Router
  - **Estilos:** Tailwind CSS
  - **Notificaciones:** React Toastify

## 🏁 Cómo Empezar

Sigue estos pasos para configurar y ejecutar el proyecto en tu máquina local.

### Prerrequisitos

Asegúrate de tener instalado [Node.js](https://nodejs.org/) (que incluye npm).

### Instalación

1.  **Clona el repositorio:**
    ```bash
    git clone https://github.com/tu-usuario/TimeLineComposer.git
    cd TimeLineComposer
    ```

2.  **Configura el Backend:**
    ```bash
    cd composer-backend
    npm install
    ```
    Crea un archivo `.env` en la raíz de `composer-backend` y añade la URL de la base de datos:
    ```env
    DATABASE_URL="file:./dev.db"
    ```
    Finalmente, genera el cliente de Prisma y aplica las migraciones para crear la base de datos:
    ```bash
    npx prisma generate
    npx prisma db push
    ```

3.  **Configura el Frontend:**
    ```bash
    cd ../composer-frontend
    npm install
    ```

### Ejecución

Debes tener dos terminales abiertas, una para el backend y otra para el frontend.

1.  **Iniciar el Backend:**
    ```bash
    cd composer-backend
    npm start
    ```
    Por defecto, el servidor se ejecutará en `http://localhost:3001`.

2.  **Iniciar el Frontend:**
    ```bash
    cd composer-frontend
    npm start
    ```
    La aplicación se abrirá automáticamente en `http://localhost:3000`.

## ✨ Flujo de Publicación de Aportes

El corazón del proyecto es el proceso colaborativo. Así es como un aporte llega a publicarse:

1.  **Sugerencia del Usuario:** Un visitante hace clic en "Sugerir un Compositor" y completa el formulario con toda la información que posee. Al enviarlo, proporciona su correo electrónico.
2.  **Revisión del Curador:** El aporte llega al panel del administrador con el estado "Pendiente de Revisión". El curador analiza la información, verifica las fuentes y la completitud.
3.  **Decisión:**
    - **Aprobado:** Si el aporte es preciso y completo, el curador lo aprueba. El compositor se hace visible en la línea de tiempo pública y el usuario recibe los puntos correspondientes.
    - **Rechazado (Necesita Revisión):** Si falta información o hay errores, el curador rechaza el aporte y escribe una nota con las correcciones necesarias.
4.  **Corrección del Usuario:** El usuario puede ir a la sección "Mis Aportes" (verificando su identidad con un código a su email), donde verá el feedback del curador y podrá editar su envío para corregirlo.
5.  **Reenvío:** Una vez corregido, el aporte vuelve al paso 2, listo para una nueva revisión.

## 📄 Licencia

Este proyecto está bajo la Licencia MIT. Consulta el archivo `LICENSE` para más detalles.
