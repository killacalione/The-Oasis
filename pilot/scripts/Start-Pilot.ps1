param(
  [string]$LanAddress = '127.0.0.1',
  [int]$Port = 2567,
  [switch]$InstallDependencies
)
$ErrorActionPreference = 'Stop'
$taskRoot = [IO.Path]::GetFullPath((Join-Path $PSScriptRoot '../..'))
$taskRuntime = Join-Path $taskRoot '.local/tools/node-v24.22.1-win-x64'
$taskNode = Join-Path $taskRuntime 'node.exe'
if (-not (Test-Path -LiteralPath $taskNode)) {
  $taskTools = Join-Path $taskRoot '.local/tools'
  New-Item -ItemType Directory -Force -Path $taskTools | Out-Null
  $taskZip = Join-Path $taskTools 'node-v24.22.1-win-x64.zip'
  Invoke-WebRequest 'https://nodejs.org/dist/v24.22.1/node-v24.22.1-win-x64.zip' -OutFile $taskZip
  $taskHash = (Get-FileHash -LiteralPath $taskZip -Algorithm SHA256).Hash.ToLowerInvariant()
  if ($taskHash -ne 'd2046d28c2c3dcd211ac5145c0bf30e2047ef9dfb306693c8c6e2eccd8b95fa5') { throw 'Portable Node checksum mismatch. Stop and verify the official release.' }
  Expand-Archive -LiteralPath $taskZip -DestinationPath $taskTools -Force
}
if ($LanAddress -ne '127.0.0.1') {
  $taskInterfaces = [Net.NetworkInformation.NetworkInterface]::GetAllNetworkInterfaces() | Where-Object {
    $_.OperationalStatus -eq 'Up' -and $_.NetworkInterfaceType -in @('Ethernet', 'Wireless80211')
  }
  $taskAddresses = @($taskInterfaces | ForEach-Object { $_.GetIPProperties().UnicastAddresses | ForEach-Object { $_.Address.ToString() } })
  if ($LanAddress -notin $taskAddresses) { throw 'Select an IPv4 address actually assigned to an active Ethernet or Wi-Fi interface. No VPN or wildcard binding is selected automatically.' }
}
Push-Location $taskRoot
$taskOldPath = $env:PATH
try {
  $env:PATH = "$taskRuntime;$env:PATH"
  if ($InstallDependencies -or -not (Test-Path -LiteralPath (Join-Path $taskRoot 'node_modules/esbuild'))) {
    & $taskNode (Join-Path $taskRuntime 'node_modules/npm/bin/npm-cli.js') ci --ignore-scripts --no-fund --no-audit
    if ($LASTEXITCODE -ne 0) { throw 'Pinned dependency installation failed.' }
  }
  & $taskNode (Join-Path $taskRoot 'pilot/scripts/build.mjs')
  if ($LASTEXITCODE -ne 0) { throw 'Pilot build failed.' }
  $env:OASIS_BIND = $LanAddress
  $env:OASIS_PORT = [string]$Port
  & $taskNode (Join-Path $taskRoot 'pilot/scripts/supervise.mjs')
} finally { $env:PATH = $taskOldPath; Pop-Location }
