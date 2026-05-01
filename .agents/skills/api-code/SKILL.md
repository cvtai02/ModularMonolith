---
name: api-code
description: Implement/Update API endpoints.
---

# Important
- If you are Codex, do not run, build, test, restore, migrate, or scaffold with `dotnet`.
- Use PowerShell for shell work in this repo.
- Do not use `rg`; use PowerShell-native search commands.

# Context
- `src/Modules/*/Api/` for API implementation
- `src/Modules/*/DTOs/` for request/response DTOs. Do not place DTOs under `Core`.
- `src/Modules/*/Api/api.md` for concise API summaries only.
- `src/Intermediary/**` for intermediary services / integration events between modules
- `src/Infrastructure/**` and `src/AppHost/**` are limited-scope areas; touch them only when the task truly requires it.
- `src/SharedKernel/**` is read-only unless the user explicitly approves changes.
- `src/clients/shared/**` may be edited only for backend contract work.
- Never read or edit `src/clients/admin/**`, any other frontend client folder, or `src/clients/shared/api/lib/**`.

# API Flow
1. Inspect the existing module patterns before implementing.
2. Add or update DTOs under `src/Modules/<ModuleName>/DTOs/**`.
3. Add or update use cases/controllers under `src/Modules/<ModuleName>/Api/**` using the module's existing style.
4. Register use cases in `src/Modules/<ModuleName>/<ModuleName>Module.cs` or the module registration file already used by that module.
5. Update `src/Modules/<ModuleName>/Api/api.md` with endpoint summaries only:
   - route and method
   - auth requirement
   - DTO links by file path
   - short behavior notes
   - do not inline full request/response property details
6. Update shared API contracts when backend API shape changes:
   - type aliases live in `src/clients/shared/api/types/<modulename>.ts`
   - shared client implementation lives in `src/clients/shared/api/clients/<modulename>.ts`
   - interface contracts live in `src/clients/shared/api/contracts/<modulename>.ts`
   - comments above each interface method should point to the exact backend DTO `.cs` file for each request/response type
   - do not edit `src/clients/shared/api/lib/**`
7. If frontend work is needed, write a Claude handoff document instead of editing frontend client code.

# Planning And Requirements
- When the user asks for a plan, create or update a plan file under `requirements/` before implementation.
- Requirement documents are for Claude/frontend handoff too, so include concrete request/response type shapes when needed.
- Do not centralize all type details into one generic document.
- Each requirement document should tell Claude to move that requirement file to a `done` subfolder after implementation.
- Keep completed requirement summaries short in `requirements/done/**`; remove excessive implementation detail.

# Migrations
- If entity/schema changes require a migration, do not run migration commands.
- At the end of the task, provide a migration handoff for Claude/the user with:
  - module/project
  - suggested migration name
  - why it is needed
  - schema changes expected

# API Strategies
- Use the module's existing pagination/filtering/sorting request DTO patterns.
- Keep public/admin endpoint authorization behavior explicit in controller/use case code and API summaries.
