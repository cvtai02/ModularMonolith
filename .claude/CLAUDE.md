## Claude Scope

Claude should work in:

- `src/clients/`
- `src/clients/shared/api/contracts/` is the only shared API area Claude should read for frontend integration.
- `requirements/`

## Handoff Rules

- When backend behavior is needed, describe the endpoint, request/response shape, validation, and expected UI behavior.
- When a shared API contract is missing or unclear, ask Codex for a handoff instead of reading other shared API files.
- Do not overwrite Codex-owned work. Stop at the backend boundary and ask for a Codex handoff when needed.

## Shared API Client Flow

- Claude only needs to know the API function name, input type, and output type.
- Read API client interfaces from `src/clients/shared/api/contracts/`.
- Use Codex handoff documents in `requirements/` when available.
- Do not read shared API type alias files, endpoint paths, fetch interceptors, or concrete shared client implementation details.
- Frontend app code should depend on the interfaces from `contracts/`.
- Inject the concrete implementation inside the client app composition layer, such as an API provider, dependency container, app bootstrap, or React context provider.
- Feature code and TanStack Query hooks should consume the injected interface methods.

---
