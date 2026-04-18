param(
    [Parameter(Mandatory = $true)][string]$Module,
    [Parameter(Mandatory = $true)][string]$PreviousMigration
)

$project = "src/Modules/$Module/$Module.csproj"
$startup = "src/AppHost/AppHost.csproj"
$context = "$Module.${Module}DbContext"

$updateCmd = "dotnet ef database update $PreviousMigration --project $project --startup-project $startup --context $context"
$removeCmd = "dotnet ef migrations remove --project $project --startup-project $startup --context $context"

Write-Host "Resetting to '$PreviousMigration' for module '$Module'..." -ForegroundColor Yellow

Write-Host "Step 1: Rolling back database..." -ForegroundColor Cyan
Invoke-Expression $updateCmd

if ($LASTEXITCODE -ne 0) {
    Write-Error "Database rollback failed. Aborting."
    exit 1
}

Write-Host "Step 2: Removing last migration..." -ForegroundColor Cyan
Invoke-Expression $removeCmd