#!/bin/bash

# Hook para asegurar que el directorio dist existe
echo "Verificando estructura de directorios..."

# Verificar si existe el directorio dist
if [ ! -d "/var/app/staging/dist" ]; then
    echo "Directorio dist no encontrado. Verificando si el build se completó correctamente..."
    
    # Si no existe dist, intentar hacer build
    if [ -f "/var/app/staging/package.json" ]; then
        echo "Ejecutando npm run build..."
        cd /var/app/staging
        npm run build
    else
        echo "ERROR: No se encontró package.json"
        exit 1
    fi
else
    echo "Directorio dist encontrado correctamente"
fi

# Verificar permisos
chmod -R 755 /var/app/staging/dist
echo "Permisos configurados correctamente"

echo "Prebuild hook completado exitosamente"
