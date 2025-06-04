# Script para convertir todos los archivos .sh a UTF-8 sin BOM y terminaciones LF

# Lista de archivos a convertir
$files = @(
    ".platform\hooks\prebuild\01_ensure_dist.sh",
    ".platform\hooks\postdeploy\01_restart_nginx.sh"
)

foreach ($file in $files) {
    if (Test-Path $file) {
        Write-Host "Procesando: $file"
        $content = Get-Content $file -Raw
        $content = $content -replace "`r`n", "`n"
        $utf8NoBom = New-Object System.Text.UTF8Encoding($false)
        [System.IO.File]::WriteAllText($file, $content, $utf8NoBom)
        Write-Host "  ✓ Convertido a UTF-8 sin BOM con terminaciones LF"
    } else {
        Write-Host "  ✗ Archivo no encontrado: $file"
    }
}

Write-Host "`nTodos los archivos han sido procesados."
