---
name: frontend-handoff
description: >
  Skill for frontend-handoff implementation
---

# Frontend Feature Rules

## Context

- Admin app code lives under `src/clients/admin/src`.
- Nekomin app lives under `src/clients/nekomin`.
- Framework: shadcn, vites, typescript, reactjs, tanstackquery, zustand.

## Frontend Handoff Workflow

- Start with the relevant handoff document under `requirements/frontend-handoff/`.
- Treat the handoff as the source of frontend behavior, UX expectations, API behavior, and API client methods to use.
- After implementation, move the handoff document to `requirements/frontend-handoff/done/` with a short completion summary.
- If the handoff says the backend response is missing data needed for the UI, document the backend gap as backend-handoff instead of inventing frontend-only state as the source of truth.

## API Client And Types

- Use the API client contract file path and method names listed in the handoff.
- Read Api types implementation details from backend DTOs folder.
- API client interfaces and types are export from `src/clients/shared/api/contracts/`.
- Do not create temporary API types unless the handoff explicitly identifies a missing shared contract. If a contract is missing, stop and document the backend/shared-client gap.

## TanStack Query
- Invalidate or refresh affected queries after successful mutations.
- Surface validation errors from the API in the relevant form fields where possible.

## React Components
- Break down the UI into reusable components.
- Keep forms and mutation state explicit: loading, success, validation error, and empty states.
- Keep feature behavior aligned with the handoff; avoid adding unrelated frontend scope.