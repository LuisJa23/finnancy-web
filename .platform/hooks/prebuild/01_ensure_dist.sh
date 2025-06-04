#!/bin/bash

echo "=== Iniciando prebuild hook ==="

# Verificar si existe la carpeta dist
if [ -d "/var/app/staging/dist" ]; then
    echo "La carpeta dist ya existe"
else
    echo "Creando carpeta dist..."
    mkdir -p /var/app/staging/dist
fi

echo "=== Prebuild hook completado exitosamente ==="