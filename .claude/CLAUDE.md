## Claude Scope

Claude should work in:

- `src/clients/`
- `src/clients/shared/api/contracts/` is the only shared API area Claude should read for api-client interfaces and api types.
- `requirements/`
- `src/Modules/*/DTOS/*.cs` for details of api client types. (Read only)

## Rules
- Run `npm run lint` and fix problems after **LARGE** changes
- When a shared API contract is missing or unclear, write a backend-handoff instead of reading other shared API files.
- Restrict to read specification/implementation. Focus on Interfaces/Abstractions.