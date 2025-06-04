$filePath = "c:\Users\luisj\OneDrive\Desktop\Distribuidos\finnancy-front-main\finnancy-front-main\.platform\hooks\prebuild\01_ensure_dist.sh"
$content = Get-Content $filePath -Raw
$content = $content -replace "`r`n", "`n"
$utf8NoBom = New-Object System.Text.UTF8Encoding($false)
[System.IO.File]::WriteAllText($filePath, $content, $utf8NoBom)
Write-Host "Archivo convertido a UTF-8 sin BOM con terminaciones LF"
