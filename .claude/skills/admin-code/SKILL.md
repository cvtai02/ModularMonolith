---
name: admin-code
description: >
  Skill for admin ui features development.
---
# Frontend Feature Rules

## Context
- `src/clients/admin/src`

## API Types Involvement
- Read `src/clients/shared/api/<modulename>-types.ts` and find the relevant types for the API you are working with.
- If there is no existing type, define temporary types in `src/clients/shared/api/missing-api.ts`.
- Remove types in missing-api.ts if there are types you need appear module-types file.

### 2. API Client
Use the TanStack Query wrapper in [api-client.ts](../../../admin/src/api/api-client.ts).
- `tanstackQueryClient` — mostly used

### 3. React Components
- break down the UI into reusable components