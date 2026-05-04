$ErrorActionPreference = "Stop"
$port = 5173
$root = $PSScriptRoot
$listener = New-Object System.Net.HttpListener
$listener.Prefixes.Add("http://localhost:$port/")
$listener.Start()
Write-Host "Static server on http://localhost:$port  root=$root"
$mimes = @{
  ".html" = "text/html; charset=utf-8"
  ".js"   = "application/javascript; charset=utf-8"
  ".css"  = "text/css; charset=utf-8"
  ".json" = "application/json; charset=utf-8"
  ".png"  = "image/png"
}
try {
  while ($listener.IsListening) {
    $ctx = $listener.GetContext()
    $req = $ctx.Request
    $res = $ctx.Response
    $path = [Uri]::UnescapeDataString($req.Url.AbsolutePath)
    if ($path -eq "/") { $path = "/tests.html" }
    $relative = $path.TrimStart("/").Replace("/", "\")
    $file = Join-Path $root $relative
    try {
      if (Test-Path $file -PathType Leaf) {
        $bytes = [System.IO.File]::ReadAllBytes($file)
        $ext = [System.IO.Path]::GetExtension($file).ToLower()
        $mime = if ($mimes.ContainsKey($ext)) { $mimes[$ext] } else { "application/octet-stream" }
        $res.ContentType = $mime
        $res.AddHeader("Cache-Control", "no-store")
        $res.ContentLength64 = [int64]$bytes.Length
        $res.SendChunked = $false
        $res.OutputStream.Write($bytes, 0, $bytes.Length)
        $res.OutputStream.Flush()
        Write-Host "200 $path  ($($bytes.Length) bytes, $mime)"
      } else {
        $res.StatusCode = 404
        Write-Host "404 $path"
      }
    } catch {
      Write-Host "ERR $path : $($_.Exception.Message)"
    } finally {
      try { $res.Close() } catch {}
    }
  }
} finally {
  $listener.Stop()
}
