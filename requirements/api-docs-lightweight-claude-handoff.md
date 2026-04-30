# Claude Handoff: Lightweight API Docs

## Context

Backend module `Api/api.md` files are no longer the source for detailed API behavior. They should stay as short endpoint indexes only.

## What Claude Should Use

- Use files under `requirements/` for detailed endpoint behavior, validation notes, request/response explanations, and frontend integration guidance.
- Use `src/clients/shared/api/*.ts` for stable frontend-facing type aliases exported by Codex.
- Requirement and handoff files should include the exact request, query, path, and response type aliases to import from `src/clients/shared/api/api-types.ts`.
- Do not treat a short `Api/api.md` entry as incomplete by itself; details may intentionally live in `requirements/`.

## Expected `api.md` Shape

Each endpoint entry should be limited to:

- Method and route.
- Authorization level.
- One-line purpose.

No long JSON examples, validation matrices, implementation notes, or frontend workflow instructions should be placed in `api.md`.

## Frontend Impact

When Claude needs detailed API behavior:

- Check the matching requirement or handoff document first.
- Import frontend contract aliases from `src/clients/shared/api/api-types.ts`.
- Ask Codex for a backend/shared-contract update if a needed alias is missing.

## Current Cleanup Target

Payment API docs were recently added with more detail than the new convention allows. Codex should trim `src/Modules/Payment/Api/api.md` and preserve detailed Payment behavior in a dedicated `requirements/` handoff or plan file.
