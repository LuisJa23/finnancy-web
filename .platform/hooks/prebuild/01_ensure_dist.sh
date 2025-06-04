#!/bin/bash

# Script para asegurar que la carpeta dist existe antes del despliegue
# Este script se ejecuta antes de que Elastic Beanstalk inicie la aplicación

echo "=== Iniciando prebuild hook ==="

# Verificar si existe la carpeta dist
if [ ! -d "dist" ]; then
    echo "La carpeta dist no existe, ejecutando build..."
    
    # Verificar si npm está disponible
    if command -v npm &> /dev/null; then
        echo "Ejecutando npm run build..."
        npm run build
    else
        echo "ERROR: npm no está disponible"
        exit 1
    fi
    
    # Verificar si el build fue exitoso
    if [ ! -d "dist" ]; then
        echo "ERROR: El build no generó la carpeta dist"
        exit 1
    fi
else
    echo "La carpeta dist ya existe"
fi

echo "=== Prebuild hook completado exitosamente ==="