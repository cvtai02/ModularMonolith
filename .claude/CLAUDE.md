## Claude Scope

Claude should work in:

- `src/clients/`
- `src/clients/shared/` is a shared contract area. Use it only for frontend integration with backend contracts, generated API types, shared client helpers, or handoff documentation.
- `requirements/`

## Handoff Rules

- When backend behavior is needed, describe the endpoint, request/response shape, validation, and expected UI behavior.
- When changing `src/clients/shared/`, note what contract changed and what Codex should verify on the backend.
- Do not overwrite Codex-owned work. Stop at the backend boundary and ask for a Codex handoff when needed.

---