# Lightweight API Docs Plan

## Goal

Keep module `Api/api.md` files as compact endpoint indexes only. Move detailed behavior, validation notes, examples, and frontend handoff details into descriptive files under `requirements/`.

## Rules

- `api.md` should list endpoint method, route, authorization level, and a short one-line purpose.
- Do not place long JSON examples, implementation notes, validation matrices, or frontend integration instructions in `api.md`.
- Detailed backend plans and cross-boundary handoffs belong in `requirements/`.
- API requirement and handoff files must name the shared request, query, path, and response type aliases exported from `src/clients/shared/api/api-types.ts` when those aliases exist.

## Next Cleanup

- Review recently edited module API docs, starting with Payment.
- Trim detailed sections from `api.md`.
- Preserve the full behavior notes in a matching `requirements/` handoff or plan file.
