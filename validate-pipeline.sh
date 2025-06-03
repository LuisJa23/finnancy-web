#!/bin/bash

# Script de validación completa para el pipeline CI/CD
# Verifica que todos los componentes estén correctamente configurados

echo "🔍 Validando configuración del pipeline CI/CD..."

# Colores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Función para mostrar resultados
show_result() {
    if [ $1 -eq 0 ]; then
        echo -e "✅ $2" 
    else
        echo -e "❌ $2"
        ERRORS=$((ERRORS + 1))
    fi
}

ERRORS=0

echo "=== Verificando archivos de configuración ==="

# Verificar buildspec.yml
if [ -f "buildspec.yml" ]; then
    # Verificar syntax básico
    grep -q "version: 0.2" buildspec.yml && grep -q "nodejs: 18" buildspec.yml
    show_result $? "buildspec.yml configurado correctamente"
else
    show_result 1 "buildspec.yml no encontrado"
fi

# Verificar app.js
if [ -f "app.js" ]; then
    grep -q "/health" app.js && grep -q "express" app.js
    show_result $? "app.js con Express y health check"
else
    show_result 1 "app.js no encontrado"
fi

# Verificar Procfile
if [ -f "Procfile" ]; then
    grep -q "web: node app.js" Procfile
    show_result $? "Procfile configurado correctamente"
else
    show_result 1 "Procfile no encontrado"
fi

# Verificar package.json
if [ -f "package.json" ]; then
    grep -q '"build"' package.json && grep -q '"start"' package.json
    show_result $? "package.json con scripts build y start"
else
    show_result 1 "package.json no encontrado"
fi

echo ""
echo "=== Verificando configuración de Elastic Beanstalk ==="

# Verificar .ebextensions
if [ -d ".ebextensions" ]; then
    show_result 0 "Directorio .ebextensions existe"
    
    # Verificar archivos de configuración
    [ -f ".ebextensions/01_node.config" ] && show_result 0 "01_node.config encontrado" || show_result 1 "01_node.config no encontrado"
    [ -f ".ebextensions/02_performance.config" ] && show_result 0 "02_performance.config encontrado" || show_result 1 "02_performance.config no encontrado"
    [ -f ".ebextensions/03_codebuild_integration.config" ] && show_result 0 "03_codebuild_integration.config encontrado" || show_result 1 "03_codebuild_integration.config no encontrado"
else
    show_result 1 "Directorio .ebextensions no encontrado"
fi

# Verificar .platform
if [ -d ".platform" ]; then
    show_result 0 "Directorio .platform existe"
    
    if [ -f ".platform/nginx/conf.d/default.conf" ]; then
        grep -q "try_files" ".platform/nginx/conf.d/default.conf"
        show_result $? "Configuración de nginx para SPA"
    else
        show_result 1 "Configuración de nginx no encontrada"
    fi
else
    show_result 1 "Directorio .platform no encontrado"
fi

# Verificar .ebignore
if [ -f ".ebignore" ]; then
    grep -q "node_modules/" ".ebignore"
    show_result $? ".ebignore configurado correctamente"
else
    show_result 1 ".ebignore no encontrado"
fi

echo ""
echo "=== Verificando dependencias ==="

# Verificar Node.js
if command -v node &> /dev/null; then
    NODE_VERSION=$(node --version)
    echo "Node.js version: $NODE_VERSION"
    if [[ $NODE_VERSION == v18* ]]; then
        show_result 0 "Node.js 18 instalado"
    else
        show_result 1 "Node.js 18 requerido (encontrado: $NODE_VERSION)"
    fi
else
    show_result 1 "Node.js no instalado"
fi

# Verificar NPM
if command -v npm &> /dev/null; then
    NPM_VERSION=$(npm --version)
    echo "NPM version: $NPM_VERSION"
    show_result 0 "NPM instalado"
else
    show_result 1 "NPM no instalado"
fi

echo ""
echo "=== Verificando build local ==="

# Verificar que el build funciona
if npm run build > /dev/null 2>&1; then
    show_result 0 "Build local exitoso"
    
    # Verificar output del build
    if [ -d "dist" ] && [ -f "dist/index.html" ]; then
        show_result 0 "Output del build correcto (dist/index.html)"
    else
        show_result 1 "Output del build incorrecto"
    fi
else
    show_result 1 "Build local falló"
fi

echo ""
echo "=== Verificando AWS CLI ==="

# Verificar AWS CLI
if command -v aws &> /dev/null; then
    show_result 0 "AWS CLI instalado"
    
    # Verificar configuración
    if aws sts get-caller-identity &> /dev/null; then
        show_result 0 "AWS CLI configurado correctamente"
    else
        show_result 1 "AWS CLI no configurado"
    fi
else
    show_result 1 "AWS CLI no instalado"
fi

# Verificar EB CLI
if command -v eb &> /dev/null; then
    show_result 0 "EB CLI instalado"
else
    show_result 1 "EB CLI no instalado (opcional para deployment manual)"
fi

echo ""
echo "=== Resumen de validación ==="

if [ $ERRORS -eq 0 ]; then
    echo -e "${GREEN}🎉 Todos los checks pasaron! El proyecto está listo para el pipeline.${NC}"
    echo ""
    echo "Próximos pasos:"
    echo "1. Commit y push del código a GitHub"
    echo "2. Configurar CodeBuild project en AWS"
    echo "3. Configurar Elastic Beanstalk application"
    echo "4. Configurar CodePipeline"
    echo ""
    echo "Comandos útiles:"
    echo "- Build: npm run build"
    echo "- Deploy manual: eb deploy"
    echo "- Logs: eb logs --all"
else
    echo -e "${RED}❌ Se encontraron $ERRORS errores. Revisa la configuración antes de proceder.${NC}"
    exit 1
fi
