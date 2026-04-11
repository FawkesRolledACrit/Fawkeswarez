# Test consistency between PowerShell and JavaScript calculations

$BLOCK_DURATION = 30 * 60 * 1000  # 30 minutes in ms
$startDate = "2026-04-01"
$today = Get-Date "2026-04-10"  # Fixed date for testing

Write-Host "Testing date: $today"
Write-Host "Start date: $startDate"
Write-Host ""

# Test 6:00 AM and 6:30 AM
$times = @("6:00 AM", "6:30 AM")

foreach ($timeStr in $times) {
    Write-Host "=== $timeStr ==="
    
    # PowerShell calculation (same as guide.html)
    $timeMatch = [regex]::Match($timeStr, "(\d{1,2}):(\d{2})\s*(AM|PM)")
    if ($timeMatch.Success) {
        $hour = [int]$timeMatch.Groups[1].Value
        $minute = [int]$timeMatch.Groups[2].Value
        $ampm = $timeMatch.Groups[3].Value.ToUpper()
        
        if ($hour -eq 12) { $hour = 0 }
        if ($ampm -eq "PM") { $hour += 12 }
        
        $slotDate = Get-Date -Year $today.Year -Month $today.Month -Day $today.Day -Hour $hour -Minute $minute -Second 0
        
        # Method 1: Direct slot calculation (guide.html)
        $april1 = Get-Date "2026-04-01 00:00:00"
        $msDiff = ($slotDate - $april1).TotalMilliseconds
        $totalSlots = [math]::Floor($msDiff / (1000 * 60 * 30))
        $episode1 = ($totalSlots % 11) + 1
        
        # Method 2: JavaScript-style calculation (tv.js)
        $startMs = (Get-Date $startDate).ToUniversal().Ticks / 10000  # Approximate
        $startBlockIndex = [math]::Floor($startMs / $BLOCK_DURATION)
        $globalBlockIndex = [math]::Floor($slotDate.ToUniversal().Ticks / 10000 / $BLOCK_DURATION)
        $rel = $globalBlockIndex - $startBlockIndex
        $episodeIndex = [math]::Abs($rel % 11)
        $episode2 = $episodeIndex + 1
        
        Write-Host "Slot date: $slotDate"
        Write-Host "Method 1 (guide): Episode $episode1"
        Write-Host "Method 2 (tv.js): Episode $episode2"
        Write-Host "Global block index: $globalBlockIndex"
        Write-Host "Start block index: $startBlockIndex"
        Write-Host "Relative: $rel"
        Write-Host ""
    }
}
