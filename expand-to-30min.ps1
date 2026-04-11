# Expand weekly-lineup.json to true 30-minute grid
# Every 1-hour slot becomes two 30-min slots with same program

$json = Get-Content "tv/weekly-lineup.json" | ConvertFrom-Json

$out = @()
foreach ($entry in $json) {
    # Parse hour and minute
    if ($entry.time -match "(\d{1,2}):(\d{2})\s*(AM|PM)") {
        $hour = [int]$matches[1]
        $minute = [int]$matches[2]
        $ampm = $matches[3]

        # Convert to 24h for easier math
        if ($ampm -eq "PM" -and $hour -ne 12) { $hour += 12 }
        if ($ampm -eq "AM" -and $hour -eq 12) { $hour = 0 }

        # First 30-min slot (as-is)
        $dispHour1 = if ($hour -eq 0) { 12 } elseif ($hour -gt 12) { $hour - 12 } else { $hour }
        $ampm1 = if ($hour -lt 12) { "AM" } else { "PM" }
        $time1 = "{0:D1}:{1:D2} {2}" -f $dispHour1, $minute, $ampm1
        $out += @{
            day = $entry.day
            time = $time1
            program = $entry.program
        }

        # Second 30-min slot (+30 min)
        $minute2 = $minute + 30
        $hour2 = $hour
        if ($minute2 -ge 60) {
            $minute2 -= 60
            $hour2++
            if ($hour2 -eq 24) { $hour2 = 0 }
        }
        $dispHour2 = if ($hour2 -eq 0) { 12 } elseif ($hour2 -gt 12) { $hour2 - 12 } else { $hour2 }
        $ampm2 = if ($hour2 -lt 12) { "AM" } else { "PM" }
        $time2 = "{0:D1}:{1:D2} {2}" -f $dispHour2, $minute2, $ampm2
        $out += @{
            day = $entry.day
            time = $time2
            program = $entry.program
        }
    } else {
        # If parsing fails, keep as-is (shouldn't happen)
        $out += $entry
    }
}

# Sort by day then time
$dayOrder = @("Monday","Tuesday","Wednesday","Thursday","Friday","Saturday","Sunday")
$out = $out | Sort-Object { $dayOrder.IndexOf($_.day) }, @{ Expression={ [datetime]::Parse($_.time) } }

$out | ConvertTo-Json -Depth 10 | Set-Content "tv/weekly-lineup-30min.json"
Write-Host "Wrote tv/weekly-lineup-30min.json with $($out.Count) slots"
