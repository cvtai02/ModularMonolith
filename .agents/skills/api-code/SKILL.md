---
name: api-code
description: Implement/Update API endpoints.
---

# Important: If you are Codex, DONT RUN BUILD ANYTHING.

# Context
- `src/Modules/*/Api/` for API implementation
- `src/Modules/*/Api/api.md` for API documentation
- `src/Intermediary/**` for intermediary services / integration events between modules
- Never read `src/Infrastructures`.
- Restrict to read `src/AppHost`

# Api Rules
- Update `<ModuleName>/Api/api.md` when you add/delete APIs
- After finishing API implementation, update `src/clients/shared/api/<modulename>-types.ts` for the affected module.
- Usecases is registered with ServicesProvider in `src/Modules/<ModuleName>/Module.cs`.

# Api strategies: 
- Pagination, Filtering, Sorting, ... -> Use graphql
