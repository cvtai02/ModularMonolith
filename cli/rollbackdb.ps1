param(
    [string]$ModuleName,
    [string]$Name = (Get-Date).ToUniversalTime().ToString("yyyyMMddHHmmss"),
    [string]$DbContextClassName = "${ModuleName}DbContext"
)

$ProjectPath = "src\Modules\$ModuleName\$ModuleName.csproj"
$StartupProjectPath = "src\AppHost\AppHost.csproj"
$ContextName = "$ModuleName.Core.DatabaseContext.$DbContextClassName"

dotnet ef database update $Name `
    --project "$ProjectPath" `
    --startup-project "$StartupProjectPath" `
    --context "$ContextName"