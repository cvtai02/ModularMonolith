---
name: admin-code
description: >
  Use this skill when building new frontend features that require API data,
  forms, state management, or UI components. Trigger whenever the user mentions
  adding a new page, feature, form, or data-fetching in the admin frontend.
---

# Frontend Feature Workflow
## Context
- ${WorkSpaceFolder}/src/clients/admin

## Steps

### 1. Check API Types

Run the `api-types-integration` flow first to ensure types are up to date.

If the types you need don't exist yet, implement the API endpoint first using the `backend-skill`.

### 2. Fetch Data

Always use the existing TanStack Query wrapper clients in:
api/api-client.ts

Never call fetch or axios directly.

## Conventions

| Concern          | Library           |
|------------------|-------------------|
| Data Fetching    | TanStack Query (via `api-client.ts`) |
| Forms            | React Hook Form   |
| State Management | Zustand           |
| UI Components    | shadcn/ui         |
| API Types        | ${WorkSpaceFolder}/src/clients/shared/api/api-types.ts |