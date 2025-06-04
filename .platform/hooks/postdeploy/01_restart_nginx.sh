#!/bin/bash

echo "=== Iniciando postdeploy hook ==="

# Reiniciar nginx para aplicar configuraciones
sudo service nginx reload

echo "=== Postdeploy hook completado exitosamente ==="
