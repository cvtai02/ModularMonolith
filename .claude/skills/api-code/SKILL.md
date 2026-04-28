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
- Usecases is registered with ServicesProvider in `src/Modules/<ModuleName>/Module.cs`.
- Ignore if changes to APIs do not define DTOs class for request/response. After adding/updating APIs, if there are changes in Response Class Name or Request Class Name, run skill #file:../api-types-integration/SKILL.md . 

# Api strategies: 
- Pagination, Filtering, Sorting, ... -> Use graphql