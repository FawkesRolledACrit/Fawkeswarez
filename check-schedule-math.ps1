$schedPath = ".\tv\schedule.json"
if (!(Test-Path $schedPath)) { throw "Missing $schedPath" }
$sched = Get-Content -Raw $schedPath | ConvertFrom-Json

$idx = 0
foreach ($b in $sched.blocks) {
  $idx++
  $fixed = 0
  foreach ($e in $b.events) {
    if ($e.type -eq 'segment') {
      $fixed += [int]$e.durationSeconds
    } elseif ($e.type -eq 'adbreak' -and $e.targetSeconds -ne 'auto') {
      $fixed += [int]$e.targetSeconds
    }
  }
  $rem = [int]$b.slotSeconds - $fixed
  Write-Host (('{0,2}' -f $idx) + ": " + $b.title + " fixed=" + $fixed + " rem=" + $rem)
}
