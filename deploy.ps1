# Script de deployment para AWS Elastic Beanstalk
# Ejecutar desde PowerShell en el directorio del proyecto

param(
    [string]$EnvironmentName = "",
    [string]$ApplicationName = "finnancy-front"
)

Write-Host "=== Iniciando proceso de deployment a AWS Elastic Beanstalk ===" -ForegroundColor Green

# Verificar que AWS CLI esté instalado
try {
    aws --version | Out-Null
    Write-Host "✓ AWS CLI encontrado" -ForegroundColor Green
} catch {
    Write-Host "✗ AWS CLI no encontrado. Por favor instala AWS CLI primero." -ForegroundColor Red
    exit 1
}

# Verificar que EB CLI esté instalado
try {
    eb --version | Out-Null
    Write-Host "✓ EB CLI encontrado" -ForegroundColor Green
} catch {
    Write-Host "✗ EB CLI no encontrado. Por favor instala EB CLI primero." -ForegroundColor Red
    exit 1
}

# Limpiar build anterior
Write-Host "=== Limpiando build anterior ===" -ForegroundColor Yellow
if (Test-Path "dist") {
    Remove-Item -Recurse -Force "dist"
    Write-Host "✓ Directorio dist eliminado" -ForegroundColor Green
}

# Ejecutar build local
Write-Host "=== Ejecutando build local ===" -ForegroundColor Yellow
npm run build
if ($LASTEXITCODE -ne 0) {
    Write-Host "✗ Error en el build local" -ForegroundColor Red
    exit 1
}
Write-Host "✓ Build local completado" -ForegroundColor Green

# Verificar archivos críticos
Write-Host "=== Verificando archivos críticos ===" -ForegroundColor Yellow
$criticalFiles = @("dist/index.html", "app.js", "package.json", "Procfile")
foreach ($file in $criticalFiles) {
    if (Test-Path $file) {
        Write-Host "✓ $file existe" -ForegroundColor Green
    } else {
        Write-Host "✗ $file no existe" -ForegroundColor Red
        exit 1
    }
}

# Mostrar estado de Git
Write-Host "=== Estado de Git ===" -ForegroundColor Yellow
git status --porcelain

# Preguntar si continuar con el deployment
if ($EnvironmentName -eq "") {
    $EnvironmentName = Read-Host "Ingresa el nombre del entorno de Elastic Beanstalk"
}

$confirm = Read-Host "¿Continuar con el deployment a '$EnvironmentName'? (y/N)"
if ($confirm -ne "y" -and $confirm -ne "Y") {
    Write-Host "Deployment cancelado por el usuario" -ForegroundColor Yellow
    exit 0
}

# Ejecutar deployment
Write-Host "=== Iniciando deployment ===" -ForegroundColor Yellow
eb deploy $EnvironmentName

if ($LASTEXITCODE -eq 0) {
    Write-Host "=== Deployment completado exitosamente ===" -ForegroundColor Green
    Write-Host "La aplicación debería estar disponible en breve." -ForegroundColor Green
    
    # Obtener URL del entorno
    try {
        $url = eb status $EnvironmentName | Select-String "CNAME:" | ForEach-Object { ($_ -split ":")[1].Trim() }
        if ($url) {
            Write-Host "URL de la aplicación: http://$url" -ForegroundColor Cyan
        }
    } catch {
        Write-Host "No se pudo obtener la URL automáticamente. Usa 'eb open' para abrir la aplicación." -ForegroundColor Yellow
    }
} else {
    Write-Host "✗ Error durante el deployment" -ForegroundColor Red
    Write-Host "Revisa los logs con: eb logs $EnvironmentName" -ForegroundColor Yellow
    exit 1
}
