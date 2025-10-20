1. Run the generate-openapi-types right after build, which update api types for clients
2. All Backend Modules are scanned in `AddModules.cs`. Module.RegisterModule() is called befor app.Build() and Module.Run() is called after app.Build().

3. Contracts in SharedKerel. Find how them is used in the infrastructure.