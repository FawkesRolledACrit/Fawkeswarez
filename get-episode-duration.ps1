$ffprobe = "C:\Program Files\Shotcut\ffprobe.exe"
if (!(Test-Path $ffprobe)) {
    Write-Error "ffprobe not found at $ffprobe"
    exit 1
}

$videoUrl = "https://files.catbox.moe/z5p8i9.mp4"
Write-Host "Getting duration for: $videoUrl"

try {
    $dur = & $ffprobe -v error -show_entries format=duration -of default=noprint_wrappers=1:nokey=1 $videoUrl
    if ($LASTEXITCODE -ne 0 -or [string]::IsNullOrWhiteSpace($dur)) {
        Write-Error "Failed to get duration"
        exit 1
    }
    
    $d = [double]$dur
    $val = [math]::Round($d, 3)
    
    Write-Host "Duration: $val seconds"
    Write-Host "Rounded: $([math]::Round($val)) seconds"
    Write-Host "Use this in schedule.json: `"durationSeconds`": $([math]::Round($val))"
    
} catch {
    Write-Error "Failed to probe video: $_"
    exit 1
}
