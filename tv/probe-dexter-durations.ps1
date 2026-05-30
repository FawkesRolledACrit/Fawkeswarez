$ffprobe = "C:\Program Files\Shotcut\ffprobe.exe"
if (!(Test-Path $ffprobe)) {
    Write-Error "ffprobe not found at $ffprobe"
    exit 1
}

$urls = @(
  "https://files.catbox.moe/m6185b.mp4", # E01 P1
  "https://files.catbox.moe/z5p8i9.mp4", # E01 P2
  "https://files.catbox.moe/p5iqzf.mp4",
  "https://files.catbox.moe/lqbh1k.mp4",
  "https://files.catbox.moe/mmdxdc.mp4",
  "https://files.catbox.moe/g8jcmg.mp4",
  "https://files.catbox.moe/b6thw1.mp4",
  "https://files.catbox.moe/34efpn.mp4",
  "https://files.catbox.moe/i73ka6.mp4",
  "https://files.catbox.moe/pjfz83.mp4",
  "https://files.catbox.moe/cuh5m3.mp4",
  "https://files.catbox.moe/z0g1wd.mp4",
  "https://files.catbox.moe/j3upop.mp4",
  "https://files.catbox.moe/vpkma9.mp4",
  "https://files.catbox.moe/y2md7d.mp4",
  "https://files.catbox.moe/rzrfns.mp4",
  "https://files.catbox.moe/z7j79w.mp4",
  "https://files.catbox.moe/mqzeun.mp4",
  "https://files.catbox.moe/rtqg8h.mp4",
  "https://files.catbox.moe/siazrl.mp4",
  "https://files.catbox.moe/2uj9y0.mp4",
  "https://files.catbox.moe/h0jb11.mp4",
  "https://files.catbox.moe/ouej2x.mp4",
  "https://files.catbox.moe/ap15x4.mp4",
  "https://files.catbox.moe/hyiaet.mp4",
  "https://files.catbox.moe/dhysd8.mp4",
  "https://files.catbox.moe/khzmxe.mp4",
  "https://files.catbox.moe/kp8jz4.mp4"
)

$out = @()
$total = $urls.Count
$i = 0
foreach ($u in $urls) {
  $i++
  Write-Host "[$i/$total] Probing $u"
  try {
    $dur = & $ffprobe -v error -show_entries format=duration -of default=noprint_wrappers=1:nokey=1 $u
    if ($LASTEXITCODE -ne 0 -or [string]::IsNullOrWhiteSpace($dur)) {
      $sec = $null
    } else {
      $sec = [int][math]::Round([double]$dur)
    }
  } catch {
    $sec = $null
  }

  $out += [pscustomobject]@{ url = $u; durationSeconds = $sec }
}

$out | ConvertTo-Json -Depth 3
