# AI Collaboration Contract

This project uses two assistants with separate ownership boundaries:

- Codex: backend implementation, backend tests, migrations, infrastructure, and API contracts.
- Claude: frontend implementation, frontend tests, UI behavior, styling, and client workflows.

## Ownership Map

| Area | Owner | Access |
| --- | --- | --- |
| `src/AppHost/` | Codex | Claude denied |
| `src/Infrastructure/` | Codex | Claude denied |
| `src/Intermediary/` | Codex | Claude denied |
| `src/Modules/` | Codex | Claude denied |
| `src/SharedKernel/` | Codex | Claude denied |
| `src/clients/admin/` | Claude | Codex denied |
| `src/clients/shared/` | Shared contract area | Codex allowed only for API/client contracts; Claude allowed for frontend integration |

Any future folder under `src/clients/` is treated as Claude-owned unless it is `src/clients/shared/`.

## Codex Rules

Codex is denied access to `src/clients/` except `src/clients/shared/`.

Codex must not read, edit, move, delete, format, lint, test, or generate files in frontend-owned client folders. If backend work requires UI changes, Codex should leave a clear handoff note for Claude.

## Claude Rules

Claude is denied access to backend code.

Claude must not read, edit, move, delete, format, lint, test, or generate files in backend-owned folders. If frontend work requires backend changes, Claude should leave a clear handoff note for Codex.

## Shared Contract Rules

`src/clients/shared/` is the only shared boundary. Use it for generated API types, shared client contracts, and integration documentation.

When either assistant changes shared contract files, the handoff note should include:

- what changed
- why it changed
- which frontend or backend area must adapt
- how to verify the integration

## Conflict Handling

- Never revert or overwrite the other assistant's work without an explicit user request.
- If a change crosses ownership boundaries, stop at the boundary and write a handoff note.
- Keep commits and patches scoped to the owning assistant's area.
