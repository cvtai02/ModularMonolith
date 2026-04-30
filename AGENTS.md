# Codex Collaboration Rules

This repository is shared between Codex and Claude.

Codex owns backend work. Claude owns frontend work.

## Codex Scope

Codex may work in these backend areas:

- `src/AppHost/` (limited)
- `src/Infrastructure/` (limited)
- `src/Intermediary/`
- `src/Modules/`
- `src/SharedKernel/` (readonly, ask me if changes)

Codex may read and edit `src/clients/shared/` only when backend contract work requires shared generated types, API clients, or cross-boundary documentation.

## Planning Requests

- When the user asks for a plan, create or update a descriptive plan file under `requirements/` before doing any implementation or other work.
- The plan file should be committed as a reviewable artifact for the user before execution begins.

## .NET Build And Run Safety
- Dont run or build anything with dotnet. you will break my computer.

## Codex Denied Paths

Codex must not read, edit, move, delete, format, lint, test, or generate files in:

- `src/clients/admin/`
- any future folder under `src/clients/` except `src/clients/shared/`
- `src/clients/shared/api/lib`

If backend work needs a frontend change, Codex should document the required change for Claude instead of editing frontend files.

## Handoff Rules

- Backend API or contract changes must describe the affected endpoints, request/response shapes, validation behavior, and any shared types changed under `src/clients/shared/`.
- Keep shared contract files stable and reviewable. Do not mix backend refactors with frontend-facing contract changes unless needed.
- Do not override work from the other assistant. If a file appears outside the allowed scope, leave it untouched and note the handoff needed.

## API Documentation Style

- Keep `src/Modules/*/Api/api.md` concise. Do not write detailed implementation notes, long examples, validation rules, or frontend handoff detail in `api.md`.
- Put detailed API plans, behavior notes, request/response explanations, and Claude handoff content in descriptive files under `requirements/`.
