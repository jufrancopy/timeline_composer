#!/bin/bash

# Script de despliegue del frontend

echo "Iniciando despliegue del frontend..."

# Definir el directorio raíz del proyecto para asegurar rutas absolutas
PROJECT_ROOT="/home/jucfra/Proyectos/TimeLineComposer"

# 1. Navegar a composer-frontend, instalar dependencias y construir la aplicación
echo "Construyendo la aplicación frontend en ${PROJECT_ROOT}/composer-frontend..."
cd "${PROJECT_ROOT}/composer-frontend/" || { echo "Error: No se pudo cambiar al directorio composer-frontend."; exit 1; }
npm install --prefix "${PROJECT_ROOT}/composer-frontend/" || { echo "Error: Falló la instalación de dependencias del frontend."; exit 1; }
npm run build || { echo "Error: Falló la construcción del frontend."; exit 1; }
cd "${PROJECT_ROOT}" # Volver al directorio raíz del proyecto

# 2. Eliminar y copiar el nuevo build al directorio de despliegue
echo "Limpiando y copiando el nuevo build a /var/www/html/hmpy-frontend/"
sudo rm -rf /var/www/html/hmpy-frontend/* || { echo "Error: Falló la limpieza del directorio de despliegue."; exit 1; }
sudo cp -r "${PROJECT_ROOT}/composer-frontend/build/"* /var/www/html/hmpy-frontend/ || { echo "Error: Falló la copia de los archivos de build."; exit 1; }

# 4. Aplicar permisos de Nginx
echo "Aplicando permisos de Nginx a /var/www/html/hmpy-frontend/"
sudo chown -R www-data:www-data /var/www/html/hmpy-frontend || { echo "Error: Falló la asignación de propietario."; exit 1; }
sudo chmod -R 755 /var/www/html/hmpy-frontend || { echo "Error: Falló la asignación de permisos."; exit 1; }

echo "Despliegue del frontend completado."
