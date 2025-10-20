---
name: backend-project
description: Implements backend features for this ecommerce modular monolith using ASP.NET Core and EF Core conventions. Use when creating or modifying backend modules, controllers, validation, or integration event flows.
---

# Backend Project Rules

## Scope

Apply these conventions when working in backend code.

## Architecture

- Use the modular monolith structure with ASP.NET Core and EF Core.
- Follow Clean Architecture at the application level; module internals do not need strict Clean Architecture layering.
- For simple use cases, use `<Module>DbContext` directly in controllers instead of introducing extra abstractions.

## Integration Events

When a domain or integration event is required:

1. Add the event to `Entity.Events`.
2. Rely on `SaveChangesInterceptor` to publish events during persistence.

Do not add ad-hoc event publishing paths that bypass this flow unless explicitly requested.

## Validation

- Prefer DataAnnotations for request and model validation.
- Do not introduce FluentValidation unless explicitly required.
- On validation failure, throw `ValidationException` in RFC7807-compatible format.

## Output Expectations

When implementing backend changes:

- Keep module boundaries clear.
- Use existing project patterns for endpoints, persistence, and exception handling.
- Include brief notes on where validation and event behavior were applied.
