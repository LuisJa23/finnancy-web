# Pipeline Deployment Script para AWS CodePipeline + CodeBuild + Elastic Beanstalk

param(
    [Parameter(Mandatory=$true)]
    [string]$ApplicationName,
    
    [Parameter(Mandatory=$true)]
    [string]$EnvironmentName,
    
    [string]$ArtifactBucket,
    [string]$SourceVersion = "main"
)

Write-Host "=== Pipeline Deployment Script ===" -ForegroundColor Green
Write-Host "Application: $ApplicationName" -ForegroundColor Cyan
Write-Host "Environment: $EnvironmentName" -ForegroundColor Cyan
Write-Host "Source Version: $SourceVersion" -ForegroundColor Cyan

# Verificar AWS CLI y permisos
try {
    $awsIdentity = aws sts get-caller-identity --output json | ConvertFrom-Json
    Write-Host "✓ AWS CLI configurado - Usuario: $($awsIdentity.Arn)" -ForegroundColor Green
} catch {
    Write-Host "✗ Error con AWS CLI. Verifica la configuración." -ForegroundColor Red
    exit 1
}

# Verificar que EB CLI esté disponible
try {
    eb --version | Out-Null
    Write-Host "✓ EB CLI encontrado" -ForegroundColor Green
} catch {
    Write-Host "✗ EB CLI no encontrado. Instalando..." -ForegroundColor Yellow
    pip install awsebcli
}

# Verificar configuración de EB
if (-not (Test-Path ".elasticbeanstalk\config.yml")) {
    Write-Host "=== Inicializando configuración de Elastic Beanstalk ===" -ForegroundColor Yellow
    eb init $ApplicationName --platform "Node.js 18" --region us-east-1
}

# Verificar el estado del entorno antes del deployment
Write-Host "=== Verificando estado del entorno ===" -ForegroundColor Yellow
$envStatus = eb status $EnvironmentName --verbose

if ($LASTEXITCODE -ne 0) {
    Write-Host "✗ Error al verificar el estado del entorno" -ForegroundColor Red
    exit 1
}

# Deployment usando EB CLI
Write-Host "=== Iniciando deployment ===" -ForegroundColor Yellow
eb deploy $EnvironmentName --timeout 20

if ($LASTEXITCODE -eq 0) {
    Write-Host "=== Deployment completado exitosamente ===" -ForegroundColor Green
    
    # Verificar health check
    Write-Host "=== Verificando health check ===" -ForegroundColor Yellow
    Start-Sleep -Seconds 30
    
    try {
        $envInfo = eb status $EnvironmentName | Out-String
        $url = ($envInfo | Select-String "CNAME:").ToString().Split(':')[1].Trim()
        
        if ($url) {
            Write-Host "🌐 URL de la aplicación: http://$url" -ForegroundColor Cyan
            Write-Host "🏥 Health check: http://$url/health" -ForegroundColor Cyan
            Write-Host "ℹ️  Build info: http://$url/build-info" -ForegroundColor Cyan
            
            # Hacer un health check básico
            try {
                $healthResponse = Invoke-RestMethod "http://$url/health" -TimeoutSec 30
                Write-Host "✅ Health check exitoso: $($healthResponse.status)" -ForegroundColor Green
            } catch {
                Write-Host "⚠️  Health check falló, pero el deployment se completó" -ForegroundColor Yellow
            }
        }
    } catch {
        Write-Host "⚠️  No se pudo obtener la URL automáticamente" -ForegroundColor Yellow
    }
    
} else {
    Write-Host "✗ Error durante el deployment" -ForegroundColor Red
    Write-Host "Verificando logs..." -ForegroundColor Yellow
    eb logs $EnvironmentName --all
    exit 1
}

Write-Host "=== Pipeline deployment completado ===" -ForegroundColor Green
