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
  for ($c = 1; $c -le $cols; $c++) { $headers += [string]$ws.Cells.Item(1,$c).Text }
  $lower = $headers | ForEach-Object { $_.Trim().ToLower() }

  $dayCol = $lower.IndexOf('day') + 1
  $timeCol = $lower.IndexOf('time') + 1
  $progCol = $lower.IndexOf('program') + 1

  if ($dayCol -le 0 -or $timeCol -le 0 -or $progCol -le 0) {
    throw "Missing columns. Headers: $($headers -join ', ')"
  }

  $items = @()
  for ($r = 2; $r -le $rows; $r++) {
    $day = [string]$ws.Cells.Item($r,$dayCol).Text
    $time = [string]$ws.Cells.Item($r,$timeCol).Text
    $prog = [string]$ws.Cells.Item($r,$progCol).Text

    if ([string]::IsNullOrWhiteSpace($day) -or [string]::IsNullOrWhiteSpace($time) -or [string]::IsNullOrWhiteSpace($prog)) { continue }

    $items += [pscustomobject]@{
      day = $day.Trim()
      time = $time.Trim()
      program = $prog.Trim()
    }
  }

  $items | ConvertTo-Json -Depth 4
}
finally {
  if ($wb) { $wb.Close($false) | Out-Null }
  $excel.Quit() | Out-Null
  if ($used) { [System.Runtime.InteropServices.Marshal]::ReleaseComObject($used) | Out-Null }
  if ($ws) { [System.Runtime.InteropServices.Marshal]::ReleaseComObject($ws) | Out-Null }
  if ($wb) { [System.Runtime.InteropServices.Marshal]::ReleaseComObject($wb) | Out-Null }
  [System.Runtime.InteropServices.Marshal]::ReleaseComObject($excel) | Out-Null
}
