$ffprobe = "C:\Program Files\Shotcut\ffprobe.exe"
if (!(Test-Path $ffprobe)) {
    Write-Error "ffprobe not found at $ffprobe"
    exit 1
}

$adsPath = ".\tv\ads.json"
if (!(Test-Path $adsPath)) {
    Write-Error "ads.json not found at $adsPath"
    exit 1
}

$ads = Get-Content -Raw $adsPath | ConvertFrom-Json
$total = $ads.items.Count
$i = 0

foreach ($item in $ads.items) {
    $i++
    Write-Host "[$i/$total] $($item.url)"
    try {
        $dur = & $ffprobe -v error -show_entries format=duration -of default=noprint_wrappers=1:nokey=1 $item.url
        if ($LASTEXITCODE -ne 0 -or [string]::IsNullOrWhiteSpace($dur)) {
            $val = $null
        } else {
            $d = [double]$dur
            $val = [math]::Round($d, 3)
        }
        if ($item.PSObject.Properties.Name -contains "durationSeconds") {
            $item.durationSeconds = $val
        } else {
            $item | Add-Member -NotePropertyName durationSeconds -NotePropertyValue $val
        }
    } catch {
        Write-Warning "Failed to probe $($item.url): $_"
        if ($item.PSObject.Properties.Name -contains "durationSeconds") {
            $item.durationSeconds = $null
        } else {
            $item | Add-Member -NotePropertyName durationSeconds -NotePropertyValue $null
        }
    }
}

$json = $ads | ConvertTo-Json -Depth 10
Set-Content -Path $adsPath -Value $json -Encoding UTF8
Write-Host "Done. Updated $adsPath with durations."
