### INSTRUCCIONES CRÍTICAS:
- NUNCA eliminar archivos directamente del directorio.
- JAMÁS hacer reversiones agresivas de código sin revisar si tenemos un backup que nos garantice.
- SE HA PERDIDO DÍAS DE TRABAJO EN EL PASADO POR ELIMINAR CÓDIGO Y REVERTIR A UN PUNTO PRIMITIVO DEL SISTEMA. SE ESTÁ RECONSTRUYENDO CON AYUDA DEL AGENTE.

### Last Action:
Moved router files to a new 'routes' directory and updated imports in `index.js`.

# Información del Proyecto

## Recuperación del Sistema
- Se está recuperando el sistema de una caída con pérdida de información.
- **Errores comunes:** Inconsistencia en nombres de tablas/campos (mayúsculas/minúsculas).
- **Acción:** Siempre revisar `prisma/schema.prisma` para verificar la capitalización de nombres de tablas y campos.
- **Ajustes menores:** Si faltan comillas, hay errores de importación o cambios de nombre de campos que causen errores de edición (`old_string` no encontrado), el usuario prefiere realizarlos manualmente para evitar frustraciones.

## Estructura de Módulos
- El sistema cuenta con tres módulos principales: Admin, Docentes y Alumnos.
- Cada módulo tiene su propio mecanismo de inicio de sesión.
