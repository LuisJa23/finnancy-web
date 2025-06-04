$file1 = ".platform\hooks\prebuild\01_ensure_dist.sh"
$content1 = Get-Content $file1 -Raw
$content1 = $content1 -replace "`r`n", "`n"
$utf8NoBom = New-Object System.Text.UTF8Encoding($false)
[System.IO.File]::WriteAllText($file1, $content1, $utf8NoBom)
Write-Host "Prebuild convertido"

$file2 = ".platform\hooks\postdeploy\01_restart_nginx.sh"
$content2 = Get-Content $file2 -Raw
$content2 = $content2 -replace "`r`n", "`n"
[System.IO.File]::WriteAllText($file2, $content2, $utf8NoBom)
Write-Host "Postdeploy convertido"
