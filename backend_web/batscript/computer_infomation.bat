@echo off
TITLE IT Inventory Auto-Scanner (Port 3001)
SETLOCAL EnableDelayedExpansion

:: 1. ????????????? Admin ???????????????????????? Serial Number ??? RAM
net session >nul 2>&1
if %errorLevel% neq 0 (
    echo [!] ERROR: Please right-click and 'Run as Administrator'.
    pause
    exit /b
)

echo ---------------------------------------------------
echo  COLLECTING SYSTEM DATA - PLEASE WAIT
echo  TARGET: http://www.itsupport.local:3001
echo ---------------------------------------------------

:: 2. ????????? PowerShell ??????????????????????????????????? (?????????????????????????????)
set "ps_file=%temp%\get_inv_3001.ps1"
(
echo $ApiUrl = 'http://www.itsupport.local:3001/api/inventory/update'
echo $sys = Get-CimInstance Win32_ComputerSystem
echo $bios = Get-CimInstance Win32_BIOS
echo $os = Get-CimInstance Win32_OperatingSystem
echo $board = Get-CimInstance Win32_BaseBoard
echo $csp = Get-CimInstance Win32_ComputerSystemProduct
echo $UniqueId = $bios.SerialNumber.Trim^(^)
echo if ^($UniqueId -eq 'Default string' -or $UniqueId -eq 'System Serial Number' -or [string]::IsNullOrWhiteSpace^($UniqueId^)^) { $UniqueId = $csp.UUID.Trim^(^) }
echo $MacLAN = ''; $MacWiFi = ''; $IPAddress = ''
echo $adapters = Get-NetAdapter
echo foreach ^($adapter in $adapters^) {
echo   if ^($adapter.PhysicalMediaType -eq '802.3' -or $adapter.Name -match 'Ethernet' -or $adapter.InterfaceDescription -match 'Ethernet^|GbE^|PCIe'^) {
echo     if ^([string]::IsNullOrEmpty^($MacLAN^)^) { $MacLAN = $adapter.MacAddress }
echo   }
echo   if ^($adapter.PhysicalMediaType -eq 'Native 802.11' -or $adapter.Name -match 'Wi-Fi' -or $adapter.InterfaceDescription -match 'Wireless^|Wi-Fi'^) {
echo     if ^([string]::IsNullOrEmpty^($MacWiFi^)^) { $MacWiFi = $adapter.MacAddress }
echo   }
echo }
echo $ipConfig = Get-NetIPAddress -AddressFamily IPv4 ^| Where-Object { $_.InterfaceAlias -ne 'Loopback' -and $_.PrefixOrigin -ne 'WellKnown' } ^| Select-Object -First 1
echo if ^($ipConfig^) { $IPAddress = $ipConfig.IPAddress }
echo $CpuName = ^(Get-CimInstance Win32_Processor^).Name.Trim^(^)
echo $RamList = @^(^); foreach ^($r in Get-CimInstance Win32_PhysicalMemory^) {
echo   $type = 'Unknown'; if ^($r.SMBIOSMemoryType -eq 26^) { $type = 'DDR4' } elseif ^($r.SMBIOSMemoryType -eq 34^) { $type = 'DDR5' } elseif ^($r.Speed -ge 4800^) { $type = 'DDR5' } elseif ^($r.Speed -ge 2133^) { $type = 'DDR4' } else { $type = 'DDR3' }
echo   $RamList += @{ bank_label = $r.BankLabel; capacity_gb = [Math]::Round^($r.Capacity / 1GB, 0^); speed_mhz = $r.Speed; manufacturer = $r.Manufacturer; part_number = $r.PartNumber.Trim^(^); memory_type = $type }
echo }
echo $GpuNames = @^(^); foreach ^($g in Get-CimInstance Win32_VideoController^) { $vram = 'N/A'; if ^($g.AdapterRAM -gt 0^) { $vram = "$^([Math]::Round^($g.AdapterRAM / 1GB, 1^)^) GB" }; $GpuNames += "$^($g.Name^) ^($vram^)" }
echo $DiskList = @^(^); foreach ^($d in Get-CimInstance Win32_DiskDrive^) { $DiskList += @{ model = $d.Model; size_gb = [Math]::Round^($d.Size / 1GB, 0^); interface_type = $d.InterfaceType } }
echo $RegPaths = @^('HKLM:\SOFTWARE\Microsoft\Windows\CurrentVersion\Uninstall\*', 'HKLM:\SOFTWARE\WOW6432Node\Microsoft\Windows\CurrentVersion\Uninstall\*'^)
echo $OfficeApp = Get-ItemProperty $RegPaths -ErrorAction SilentlyContinue ^| Where-Object { $_.DisplayName -match 'Microsoft ^(Office^|365^)' -and $_.DisplayName -notmatch 'Update^|Language^|Proofing^|Click-to-Run^|component^|Access database' } ^| Select-Object -First 1
echo $OfficeVersion = if ^($OfficeApp^) { $OfficeApp.DisplayName } else { $null }
echo $payload = @{ serial_number=$UniqueId; hostname=$sys.Name; manufacturer=$sys.Manufacturer.Trim^(^); model=$sys.Model.Trim^(^); cpu_model=$CpuName; mainboard_brand=$board.Manufacturer; mainboard_model=$board.Product; os_version=$os.Caption; gpu_summary=^($GpuNames -join ', '^); ram_list=$RamList; disk_list=$DiskList; mac_ethernet=$MacLAN; mac_wifi=$MacWiFi; ip_address=$IPAddress; office_version=$OfficeVersion } ^| ConvertTo-Json -Depth 5
echo try {
echo   $response = Invoke-RestMethod -Uri $ApiUrl -Method Post -Body $payload -ContentType 'application/json'
echo   Write-Host 'SUCCESS: Inventory Updated.' -ForegroundColor Green
echo } catch {
echo   Write-Host 'ERROR: Failed to reach API on Port 3001.' -ForegroundColor Red
echo   Write-Host $_.Exception.Message
echo }
) > "%ps_file%"

:: 3. ?????????? PowerShell
powershell -NoProfile -ExecutionPolicy Bypass -File "%ps_file%"

:: 4. ??????????????
del "%ps_file%"

echo ---------------------------------------------------
echo  Scan Finished. Closing...
timeout /t 5