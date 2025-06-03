#!/bin/bash

# Script de prueba local para simular el proceso de build de AWS Elastic Beanstalk
# Ejecutar este script antes de hacer deploy para verificar que todo funciona

set -e

echo "=== Iniciando prueba de build local ==="
echo "Fecha: $(date)"
echo "Node version: $(node --version)"
echo "NPM version: $(npm --version)"

# Limpiar instalaciones previas
echo "=== Limpiando node_modules y dist ==="
if [ -d "node_modules" ]; then
    rm -rf node_modules
fi
if [ -d "dist" ]; then
    rm -rf dist
fi

# Instalar dependencias
echo "=== Instalando dependencias ==="
npm ci --include=dev

# Construir la aplicación
echo "=== Construyendo aplicación ==="
npm run build

# Verificar build
echo "=== Verificando build ==="
if [ -d "dist" ]; then
    echo "✓ Directorio dist existe"
    echo "Contenido de dist:"
    ls -la dist/
    
    if [ -f "dist/index.html" ]; then
        echo "✓ dist/index.html existe"
        echo "✓ Build verificado exitosamente"
    else
        echo "✗ dist/index.html no existe"
        exit 1
    fi
else
    echo "✗ Directorio dist no existe"
    exit 1
fi

# Probar el servidor
echo "=== Probando servidor ==="
timeout 10 npm start &
SERVER_PID=$!
sleep 5

# Verificar que el servidor responde
if curl -f http://localhost:8080/health > /dev/null 2>&1; then
    echo "✓ Servidor responde correctamente"
else
    echo "✗ Servidor no responde"
    kill $SERVER_PID 2>/dev/null || true
    exit 1
fi

# Detener servidor
kill $SERVER_PID 2>/dev/null || true

echo "=== Prueba completada exitosamente ==="
echo "El proyecto está listo para deployment a AWS Elastic Beanstalk"
