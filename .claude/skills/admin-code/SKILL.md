---
name: admin-code
description: >
  Use this skill when building new frontend features that require API data,
  forms, state management, or UI components. Trigger whenever the user mentions
  adding a new page, feature, form, or data-fetching in the admin frontend.
---

# Frontend Feature Rules

## Context
- `src/clients/admin/src`

## Skills Involvement
- [shadcn](../shadcn/SKILL.md)

## API Types Involvement
- Read `src/clients/shared/api/api-types.ts` and find the relevant types for the API you are working with.
- If there is no existing type, define temporary types in `src/clients/shared/api/missing-api.ts`.
- Remove types in missing-api.ts if not used anymore.

### 2. API Client
Use the TanStack Query wrapper in [api-client.ts](../../../src/clients/admin/src/api/api-client.ts).
- `tanstackQueryClient` — mostly used
