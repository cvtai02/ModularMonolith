---
name: create-module
description: Use this skill only when explicitely refered.
---

# Create Module FLow
1. Create Module Folder In src/Modules

Base on ProductCatalog Module, do these steps
2. create these files and folders in the Module Folder
  - .csproj file
  - Module.cs file
  - GlobalUsing.cs
  - <Module>DbContext.cs
  - Empty Folders: 
    - Core/Entities
    - Core/DTOs
    - Api

3. Add references:
  - Update src/AppHost/AppHost.csproj & src/AppHost/Buildings/ModuleList.cs