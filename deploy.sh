#!/bin/bash

# Script de despliegue del frontend

echo "Iniciando despliegue del frontend..."

# 1. Navegar a composer-frontend y construir la aplicación
echo "Construyendo la aplicación frontend..."
cd composer-frontend/ || { echo "Error: No se pudo cambiar al directorio composer-frontend."; exit 1; }
npm run build || { echo "Error: Falló la construcción del frontend."; exit 1; }
cd .. # Volver al directorio raíz del proyecto

# 2. Eliminar contenido existente en el directorio de despliegue
echo "Limpiando el directorio de despliegue: /var/www/html/hmpy-frontend/"
sudo rm -rf /var/www/html/hmpy-frontend/* || { echo "Error: Falló la limpieza del directorio de despliegue."; exit 1; }

# 3. Copiar el nuevo build al directorio de despliegue
echo "Copiando el nuevo build a /var/www/html/hmpy-frontend/"
sudo cp -r ~/Proyectos/TimeLineComposer/composer-frontend/build/* /var/www/html/hmpy-frontend/ || { echo "Error: Falló la copia de los archivos de build."; exit 1; }

# 4. Aplicar permisos de Nginx
echo "Aplicando permisos de Nginx a /var/www/html/hmpy-frontend/"
sudo chown -R www-data:www-data /var/www/html/hmpy-frontend || { echo "Error: Falló la asignación de propietario."; exit 1; }
sudo chmod -R 755 /var/www/html/hmpy-frontend || { echo "Error: Falló la asignación de permisos."; exit 1; }

echo "Despliegue del frontend completado."
