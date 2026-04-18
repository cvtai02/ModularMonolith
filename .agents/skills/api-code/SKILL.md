---
name: api-code
description: Implements backend features for this ecommerce modular monolith using ASP.NET Core and EF Core conventions. Use when creating or modifying backend modules, controllers, validation, or integration event flows.
---

# Backend Project Rules

## Scope

Apply these conventions when working in backend code.

## Architecture

- Use the modular monolith structure with ASP.NET Core and EF Core.
- Follow Clean Architecture at the application level; module internals do not need strict Clean Architecture layering.
- For simple use cases, use `<Module>DbContext` directly in controllers instead of introducing extra Service/Usecase Layer. And vice versa

## Integration Events
When integration events is required:

- Add the events to `Entity.Events`. existed `SaveChangesInterceptor` ensure events to be published during persistence.

## Request Validation
- Simple cases → Use Data Annotation attributes during model binding
- Cross-field rules → Use FluentValidation and throw ValidationException
- Database / business logic → Validate explicitly in application logic and throw ValidationException

## Output Expectations

When implementing backend changes:

- Keep module boundaries clear.
- Use existing project patterns for endpoints, persistence, and exception handling.
- Include brief notes on where validation and event behavior were applied.
