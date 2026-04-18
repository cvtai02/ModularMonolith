param(
    [Parameter(Mandatory = $true)][string]$Module,
    [string]$Name = ""
)

$project = "src/Modules/$Module/$Module.csproj"
$startup = "src/AppHost/AppHost.csproj"
$context = "$Module.${Module}DbContext"

$command = "dotnet ef database update $Name --project $project --startup-project $startup --context $context"

Write-Host "Updating database for module '$Module'$(if ($Name) { " to '$Name'" })..." -ForegroundColor Cyan
Invoke-Expression $command