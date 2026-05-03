---
name: api-code
description: Implement/Update API endpoints.
---

# Important
- If you are Codex, do not run, build, test, restore, migrate, or scaffold with `dotnet`.

# Context
- `src/Modules/*/Api/` for API implementation
- `src/Modules/*/DTOs/` for request/response DTOs. Do not place DTOs under `Core`.
- `src/Modules/*/Api/api.md` for concise API summaries only.
- `src/Intermediary/**` for intermediary services / integration events between modules
- `src/Infrastructure/**` and `src/AppHost/**` are limited-scope areas; touch them only when the API task truly requires it.
- `src/SharedKernel/**` is read-only unless the user explicitly approves changes.
- `src/clients/shared/**` may be edited only for backend contract work.

# Frontend Boundary
- Do not read, edit, move, delete, format, lint, test, or generate files in:
  - any future folder under `src/clients/` except `src/clients/shared/`
  - `src/clients/shared/api/lib/`
- If backend work needs a frontend implementation change, write a frontend-handoff document under `requirements/frontend-handoff/` instead of editing frontend files.

# API Flow
1. Create or update an abstract backend plan under `requirements/backend-plan/` before implementation.
   - Keep the plan focused on goals, API capability, affected module boundaries, validation behavior, and handoff impact.
   - Do not write detailed implementation steps, internal code notes, or frontend UI instructions in the backend plan.
   - After create plan. Stop for reviewing.
2. Implement APIs:
   - Add or update DTOs under `src/Modules/<ModuleName>/DTOs/**`.
   - Add or update use cases/controllers under `src/Modules/<ModuleName>/Api/**` using the module's existing style.
   - Register use cases in `src/Modules/<ModuleName>/<ModuleName>Module.cs` or the module registration file already used by that module.
   - move the backend-plan to requirements/done after implementation.
3. Update `src/Modules/<ModuleName>/Api/api.md` with endpoint summaries only:
   - route and method
   - auth requirement
   - DTO links by file path
   - short behavior notes
   - do not inline full request/response property details
4. Update API clients for frontend when backend API shape changes:
   - type aliases live in `src/clients/shared/api/types/<modulename>.ts`
   - shared client implementation lives in `src/clients/shared/api/clients/<modulename>.ts`
   - interface contracts live in `src/clients/shared/api/contracts/<modulename>.ts`
   - comments above each interface method should point to the exact backend DTO `.cs` file for each request/response type
   - comments above added or changed interface methods should also mention the contract method name and short behavior note
   - do not edit `src/clients/shared/api/lib/**`

5. Write a Frontend-handoff document under `requirements/frontend-handoff/`.
   - Use the title format `<feature>-frontend-handoff.md`.
   - Keep these handoffs focused on API behavior and frontend UX.
   - Mention the API client contract file path and the client methods should be used.
   - Tell Claude to move the file to `requirements/frontend-handoff/done/` after implementation.
   - Do not edit files already under a `done/` folder.

# Migrations
- If entity/schema changes require a migration, do not run migration commands.
- At the end of the task, provide a migration handoff .md in requirements/migrations that include commands to run for migrations.
