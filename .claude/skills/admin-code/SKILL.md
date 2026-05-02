---
name: admin-code
description: >
  Skill for admin UI feature development.
---

# Frontend Feature Rules

## Context

- Admin app code lives under `src/clients/admin/src`.
- Use existing admin app structure, UI components, TanStack Query patterns, and route/page conventions before adding new abstractions.

## Frontend Handoff Workflow

- Start with the relevant handoff document under `requirements/frontend-handoff/`.
- Treat the handoff as the source of frontend behavior, UX expectations, API behavior, and API client methods to use.
- After implementation, move the handoff document to `requirements/frontend-handoff/done/` with a short completion summary.
- If the handoff says the backend response is missing data needed for the UI, document the backend gap instead of inventing frontend-only state as the source of truth.

## API Client And Types

- Use the API client contract file path and method names listed in the handoff.
- Shared API contracts live under `src/clients/shared/api/contracts/`.
- Do not create temporary API types unless the handoff explicitly identifies a missing shared contract. If a contract is missing, stop and document the backend/shared-client gap.

## TanStack Query

- Use the existing admin app query and mutation patterns.
- Keep API calls routed through the shared API client abstractions already used by the admin app.
- Invalidate or refresh affected queries after successful mutations.
- Surface validation errors from the API in the relevant form fields where possible.

## React Components

- Break down the UI into reusable components.
- Keep forms and mutation state explicit: loading, success, validation error, and empty states.
- Use existing admin UI components and page patterns before adding new abstractions.
- Keep feature behavior aligned with the handoff; avoid adding unrelated frontend scope.