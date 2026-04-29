---
name: entities-migrate
description: Use this skill when there are changes in dbcontext entities.
---

# EFCore Migrations

`<ModuleName>` is the module folder name under `src/Modules/` (e.g. `ProductCatalog`, `Order`, `Inventory`).

**Add a new migration** (after changing entities or DbContext):
```powershell
.\devtools\ef-add.ps1 -Module <ModuleName> -Name <MigrationName>
```

**Apply pending migrations** to the database:
```powershell
.\devtools\ef-update.ps1 -Module <ModuleName>
```

Run `ef-add` first, review the generated migration file, then run `ef-update`.