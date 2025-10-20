---
name: admin-project
description: Builds and updates the admin client using Vite, React, TypeScript, Tailwind, shadcn/ui, TanStack Query, and React Hook Form with project-specific API type generation flow. Use when working on admin UI features, API integration, or client state and forms.
---

# Admin Project Rules

## Scope

Apply these conventions when working in the admin client.

## Stack Conventions

- Runtime and framework: Vite + React + TypeScript.
- UI and styling: Tailwind + shadcn/ui.
- Data fetching: TanStack Query + `openapi-react-query`.
- Forms: React Hook Form.
- Client state: Zustand.

## Core Integration Files

Prioritize consistency with these files:

- `src/clients/admin/src/configs/appFetch.ts`
- `src/clients/admin/src/configs/api-client.ts`

When introducing API behavior, align with existing request and error-handling patterns in these files.

## API Types Workflow (Critical)

Source of truth for generated API types:

- `src/clients/shared/api/lib/openapi-types.ts`

If types are missing or outdated:

1. Run backend service:
   ```bash
   dotnet run --project src/AppHost/AppHost.csproj
   ```
2. In another terminal, generate OpenAPI types:
   ```bash
   openapi-typescript http://localhost:5265/openapi/v1.json -o src/Clients/shared/api/lib/types.ts
   ```
3. Update exports in:
   - `src/clients/shared/api/api-types.ts`

Do not handcraft API type definitions that should come from OpenAPI generation.

## Output Expectations

When implementing admin changes:

- Use existing data-fetching and mutation patterns.
- Keep form and state logic aligned with current stack choices.
- Mention whether API types were verified or regenerated when API contracts are involved.
