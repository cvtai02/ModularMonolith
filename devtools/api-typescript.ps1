# No need to run script generating api typescript types if use vscode. it's integrate in build run process
# If not, run the API project first and then run this script

$command = "openapi-typescript http://localhost:5265/openapi/v1.json -o src/clients/shared/api/lib/openapi-types.ts --properties-required-by-default true"
Invoke-Expression $command