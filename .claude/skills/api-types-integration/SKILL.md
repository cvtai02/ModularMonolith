---
name: api-types-integration
description: >
  Use this skill when the user needs to work on tasks that involve backend APIs,
  OpenAPI type generation, or building frontend data-fetching with TanStack Query.
  Trigger whenever the user mentions API types, openapi-typescript, dotnet backend,
  or wants to add/update data fetching in the admin client. Also trigger for any
  form or state management work in the frontend.
---

# API Codegen Workflow
## Steps
### 1. Generate API Types in Typescript

Run in the terminal:

```bash
netstat -ano | findstr :5265
```

If there is no process, run:
```bash
dotnet run --project src/AppHost/AppHost.csproj
```

Run:
```bash
npx openapi-typescript http://localhost:5265/openapi/v1.json -o src/clients/shared/api/lib/openapi-types.ts
```
If you started the AppHost above, kill it after the previous command.

### 2. Sync API Types
Read the git diff for only `openapi-types.ts`. If there is no diff, stop.
Otherwise, update `src/clients/shared/api/api-types.ts` which is facade for the frontend to use.