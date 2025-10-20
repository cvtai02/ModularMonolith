
param(
    [string]$ModuleName,
    [string]$Name = (Get-Date).ToUniversalTime().ToString("yyyyMMddHHmmss"),
    [string]$DbContextClassName = "${ModuleName}DbContext"
)

$ProjectPath = "src\Modules\$ModuleName\$ModuleName.csproj"
$StartupProjectPath = "src\AppHost\AppHost.csproj"
$MigrationOutput = "Infrastructure\Data\Migrations"
$ContextName = "$ModuleName.Core.DatabaseContext.$DbContextClassName"

# Add migration
dotnet ef migrations add $Name `
    --project "$ProjectPath" `
    -o "$MigrationOutput" `
    --startup-project "$StartupProjectPath" `
    --context "$ContextName"

# Update database
dotnet ef database update `
    --project "$ProjectPath" `
    --startup-project "$StartupProjectPath" `
    --context "$ContextName"