#!/bin/bash

# Hook de post-deploy para asegurar que nginx esté funcionando correctamente
echo "Post-deploy: Verificando y reiniciando nginx si es necesario..."

# Verificar la configuración de nginx
if nginx -t; then
    echo "Configuración de nginx válida."
    # Reiniciar nginx para asegurar que la nueva configuración se aplique
    systemctl reload nginx
    echo "Nginx recargado exitosamente."
else
    echo "ERROR: Configuración de nginx inválida."
    exit 1
fi

# Verificar que nginx esté corriendo
if systemctl is-active --quiet nginx; then
    echo "Nginx está corriendo correctamente."
else
    echo "Iniciando nginx..."
    systemctl start nginx
fi

echo "Post-deploy completado."
