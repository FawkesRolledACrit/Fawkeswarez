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

  Write-Host "Rows=$rows Cols=$cols"
  Write-Host ("Headers: " + ($headers -join ' | '))

  # Guess the show/title column
  $showCol = $null
  $candidates = @('show','program','title','series','cartoon')
  for ($i = 0; $i -lt $headers.Count; $i++) {
    $h = ($headers[$i] | ForEach-Object { $_.ToString().Trim() }).ToLower()
    foreach ($cand in $candidates) {
      if ($h -eq $cand -or $h -like "*$cand*") {
        $showCol = $i + 1
        break
      }
    }
    if ($showCol) { break }
  }

  if (-not $showCol) {
    Write-Host "Could not auto-detect show column. Using column 1." 
    $showCol = 1
  }

  $counts = @{}
  for ($r = 2; $r -le $rows; $r++) {
    $val = [string]$ws.Cells.Item($r, $showCol).Text
    if ([string]::IsNullOrWhiteSpace($val)) { continue }
    $key = $val.Trim()
    if ($counts.ContainsKey($key)) { $counts[$key]++ } else { $counts[$key] = 1 }
  }

  $result = $counts.GetEnumerator() |
    Sort-Object -Property Value -Descending |
    ForEach-Object { [pscustomobject]@{ show = $_.Key; airings = $_.Value } }

  $result | ConvertTo-Json -Depth 3
}
finally {
  if ($wb) { $wb.Close($false) | Out-Null }
  $excel.Quit() | Out-Null
  if ($used) { [System.Runtime.InteropServices.Marshal]::ReleaseComObject($used) | Out-Null }
  if ($ws) { [System.Runtime.InteropServices.Marshal]::ReleaseComObject($ws) | Out-Null }
  if ($wb) { [System.Runtime.InteropServices.Marshal]::ReleaseComObject($wb) | Out-Null }
  [System.Runtime.InteropServices.Marshal]::ReleaseComObject($excel) | Out-Null
}
