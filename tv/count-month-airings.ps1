param(
  [int]$Days = 30,
  [string]$StartDay = 'Monday'
)

$ErrorActionPreference = 'Stop'

$path = Resolve-Path '.\tv\cartoon_network_color_schedule.xlsx'

$excel = New-Object -ComObject Excel.Application
$excel.Visible = $false
$excel.DisplayAlerts = $false

try {
  $wb = $excel.Workbooks.Open($path.Path)
  $ws = $wb.Worksheets.Item(1)
  $used = $ws.UsedRange

  $rows = $used.Rows.Count
  $cols = $used.Columns.Count

  $headers = @()
  for ($c = 1; $c -le $cols; $c++) {
    $headers += [string]$ws.Cells.Item(1, $c).Text
  }

  $lower = $headers | ForEach-Object { $_.ToString().Trim().ToLower() }
  $dayCol = ($lower.IndexOf('day') + 1)
  $progCol = ($lower.IndexOf('program') + 1)

  if ($dayCol -le 0 -or $progCol -le 0) {
    throw "Could not find required columns. Headers: $($headers -join ', ')"
  }

  # day -> (program -> count)
  $byDay = @{}
  $daySet = New-Object System.Collections.Generic.HashSet[string]

  for ($r = 2; $r -le $rows; $r++) {
    $day = [string]$ws.Cells.Item($r, $dayCol).Text
    $prog = [string]$ws.Cells.Item($r, $progCol).Text

    if ([string]::IsNullOrWhiteSpace($day) -or [string]::IsNullOrWhiteSpace($prog)) { continue }
    $day = $day.Trim()
    $prog = $prog.Trim()

    $daySet.Add($day) | Out-Null

    if (-not $byDay.ContainsKey($day)) {
      $byDay[$day] = @{}
    }
    if ($byDay[$day].ContainsKey($prog)) {
      $byDay[$day][$prog]++
    } else {
      $byDay[$day][$prog] = 1
    }
  }

  # Determine a stable week order.
  $knownOrder = @('Monday','Tuesday','Wednesday','Thursday','Friday','Saturday','Sunday')
  $daysInSheet = @($daySet)

  $week = @()
  foreach ($d in $knownOrder) {
    if ($daySet.Contains($d)) { $week += $d }
  }
  # Fallback: append any unrecognized day strings.
  foreach ($d in ($daysInSheet | Sort-Object)) {
    if ($week -notcontains $d) { $week += $d }
  }

  if ($week.Count -lt 7) {
    Write-Host "Warning: expected 7 unique days, found $($week.Count): $($week -join ', ')"
  }

  $startIndex = $week.IndexOf($StartDay)
  if ($startIndex -lt 0) {
    throw "StartDay '$StartDay' not found in sheet days: $($week -join ', ')"
  }

  $totals = @{}

  for ($i = 0; $i -lt $Days; $i++) {
    $dayName = $week[($startIndex + $i) % $week.Count]
    if (-not $byDay.ContainsKey($dayName)) { continue }

    foreach ($kv in $byDay[$dayName].GetEnumerator()) {
      $prog = $kv.Key
      $cnt = [int]$kv.Value
      if ($totals.ContainsKey($prog)) { $totals[$prog] += $cnt } else { $totals[$prog] = $cnt }
    }
  }

  $result = $totals.GetEnumerator() |
    Sort-Object -Property Value -Descending |
    ForEach-Object { [pscustomobject]@{ show = $_.Key; airings = $_.Value } }

  $meta = [pscustomobject]@{
    days = $Days
    startDay = $StartDay
    weekOrder = $week
  }

  [pscustomobject]@{ meta = $meta; totals = $result } | ConvertTo-Json -Depth 5
}
finally {
  if ($wb) { $wb.Close($false) | Out-Null }
  $excel.Quit() | Out-Null
  if ($used) { [System.Runtime.InteropServices.Marshal]::ReleaseComObject($used) | Out-Null }
  if ($ws) { [System.Runtime.InteropServices.Marshal]::ReleaseComObject($ws) | Out-Null }
  if ($wb) { [System.Runtime.InteropServices.Marshal]::ReleaseComObject($wb) | Out-Null }
  [System.Runtime.InteropServices.Marshal]::ReleaseComObject($excel) | Out-Null
}
