# Saves a static copy of the parts app.js builds (nav, footer, service cards, menu, cars lists) into each page,
# so search engines and AI tools that don't run JavaScript still see them. app.js replaces them on load as before.
# Then sets each sitemap.xml <lastmod> to the date its page last changed.
# Run after changing services.js, vehicles.js, app.js or a page:  powershell -File tools\prerender.ps1

$ErrorActionPreference = "Stop"
$site = Split-Path $PSScriptRoot -Parent
$utf8 = New-Object Text.UTF8Encoding $false
$pages = "index", "remote-start", "coding-menu", "cars", "enquire", "privacy", "terms"

$browser = @("${env:ProgramFiles(x86)}\Microsoft\Edge\Application\msedge.exe",
             "$env:ProgramFiles\Google\Chrome\Application\chrome.exe") | Where-Object { Test-Path $_ } | Select-Object -First 1
if (-not $browser) { throw "Needs Microsoft Edge or Google Chrome installed." }
$profileDir = Join-Path $env:TEMP "redline-prerender"
$dump = Join-Path $env:TEMP "redline-prerender.html"

# The page as the browser sees it after app.js has run. Network is blocked so Analytics doesn't count a visit,
# and reduced motion stops app.js adding its scroll-reveal classes.
function Get-RenderedPage($file) {
  $url = ([Uri]$file).AbsoluteUri
  $flags = "--headless --disable-gpu --no-first-run --user-data-dir=`"$profileDir`" " +
           "`"--host-resolver-rules=MAP * ~NOTFOUND`" --force-prefers-reduced-motion --dump-dom $url"
  Start-Process -FilePath $browser -ArgumentList $flags -RedirectStandardOutput $dump -RedirectStandardError "$dump.log" -Wait -NoNewWindow
  [IO.File]::ReadAllText($dump, $utf8)
}

foreach ($page in $pages) {
  $file = Join-Path $site "$page.html"
  $source = [IO.File]::ReadAllText($file, $utf8)
  $rendered = Get-RenderedPage $file
  $updated = [regex]::Replace($source, '<!--prerender:([\w-]+)-->([\s\S]*?)<!--/prerender:\1-->', {
    param($m)
    $id = $m.Groups[1].Value
    $open = [regex]::Match($m.Groups[2].Value, '^\s*<div[^>]*>').Value
    $built = [regex]::Match($rendered, "<!--prerender:$id-->([\s\S]*?)<!--/prerender:$id-->")
    if (-not $built.Success) { throw "$page.html: app.js output for '$id' not found" }
    # app.js either fills the placeholder (it's still there) or replaces it outright (nav, footer)
    $inner = [regex]::Match($built.Groups[1].Value, "^\s*<div[^>]*\bid=`"$id`"[^>]*>([\s\S]*)</div>\s*$")
    $html = if ($inner.Success) { $inner.Groups[1].Value } else { $built.Groups[1].Value }
    "<!--prerender:$id-->$open$html</div><!--/prerender:$id-->"
  })
  if ($updated -ne $source) {
    [IO.File]::WriteAllText($file, $updated, $utf8)
    Write-Host "updated $page.html"
  }
}
Remove-Item $dump, "$dump.log" -ErrorAction SilentlyContinue
Remove-Item $profileDir -Recurse -Force -ErrorAction SilentlyContinue

# sitemap lastmod: today for pages with uncommitted changes, otherwise the date of their last commit
$sitemapFile = Join-Path $site "sitemap.xml"
$sitemap = [IO.File]::ReadAllText($sitemapFile, $utf8)
$today = Get-Date -Format "yyyy-MM-dd"
$sitemap = [regex]::Replace($sitemap, '<url><loc>https://redlinecoding\.com\.au/([^<]*)</loc>(<lastmod>[^<]*</lastmod>)?</url>', {
  param($m)
  $name = if ($m.Groups[1].Value) { $m.Groups[1].Value } else { "index.html" }
  $changed = git -C $site status --porcelain -- $name
  $date = if ($changed) { $today } else { git -C $site log -1 --format=%cs -- $name }
  "<url><loc>https://redlinecoding.com.au/$($m.Groups[1].Value)</loc><lastmod>$date</lastmod></url>"
})
[IO.File]::WriteAllText($sitemapFile, $sitemap, $utf8)
Write-Host "sitemap.xml dates set"
