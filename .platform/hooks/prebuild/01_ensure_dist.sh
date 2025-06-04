#!/bin/bash

echo "=== Iniciando prebuild hook ==="

# Verificar que el directorio dist existe para el build de React
if [ ! -d "dist" ]; then
    echo "Creando directorio dist..."
    mkdir -p dist
    echo "Directorio dist creado exitosamente"
else
    echo "El directorio dist ya existe"
fi

echo "=== Prebuild hook completado exitosamente ==="