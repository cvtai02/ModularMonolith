param(
    [string]$Name
)

function Create {
    param (
        [string]$Name
    )

    # Create new module folder
    $modulePath = Join-Path "./src/Modules" $Name
    if (-not (Test-Path $modulePath)) {
        New-Item -ItemType Directory -Path $modulePath | Out-Null
    }

    # Create a README.md file
    $readmeFile = Join-Path $modulePath "README.md"
    if (-not (Test-Path $readmeFile)) {
        New-Item -ItemType File -Path $readmeFile -Value "# $Name Module`n`nDescription for $Name module." | Out-Null
    }

    # Create a basic module script file
    $moduleScriptFile = Join-Path $modulePath "$Name.psm1"
    if (-not (Test-Path $moduleScriptFile)) {
        New-Item -ItemType File -Path $moduleScriptFile -Value "# PowerShell module script for $Name" | Out-Null
    }
}