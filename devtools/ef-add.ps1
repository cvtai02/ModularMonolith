param(
    [Parameter(Mandatory = $true)][string]$Module,
    [Parameter(Mandatory = $true)][string]$Name
)

$project = "src/Modules/$Module/$Module.csproj"
$startup = "src/AppHost/AppHost.csproj"
$context = "$Module.${Module}DbContext"
$output  = "Infrastructure/Data/Migrations"

$command = "dotnet ef migrations add $Name --project $project -o $output --startup-project $startup --context $context"

Write-Host "Adding migration '$Name' for module '$Module'..." -ForegroundColor Cyan
Invoke-Expression $command