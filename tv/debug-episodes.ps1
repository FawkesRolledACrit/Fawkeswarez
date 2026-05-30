# Debug episode calculation for today

$today = Get-Date
$april1 = Get-Date "2026-04-01 00:00:00"

Write-Host "Today: $today"
Write-Host "April 1: $april1"

# Test 6:00 AM and 6:30 AM
$times = @("6:00 AM", "6:30 AM")

foreach ($timeStr in $times) {
    $timeMatch = [regex]::Match($timeStr, "(\d{1,2}):(\d{2})\s*(AM|PM)")
    if ($timeMatch.Success) {
        $hour = [int]$timeMatch.Groups[1].Value
        $minute = [int]$timeMatch.Groups[2].Value
        $ampm = $timeMatch.Groups[3].Value.ToUpper()
        
        if ($hour -eq 12) { $hour = 0 }
        if ($ampm -eq "PM") { $hour += 12 }
        
        $slotDate = Get-Date -Year $today.Year -Month $today.Month -Day $today.Day -Hour $hour -Minute $minute -Second 0
        
        $msDiff = ($slotDate - $april1).TotalMilliseconds
        $totalSlots = [math]::Floor($msDiff / (1000 * 60 * 30))
        $episodeIndex = $totalSlots % 11
        $episodeNum = $episodeIndex + 1
        
        Write-Host "$timeStr -> Slot at $slotDate -> Total slots: $totalSlots -> Episode: $episodeNum"
    }
}
