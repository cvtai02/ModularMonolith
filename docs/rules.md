# Project Coding Rules

## Context
- Domain: Multi-clients Ecommerce App
- Stack: ASP.NET Core (Backend) + React (Frontend)

---

## Backend

### Architecture
- Modular Monolith using ASP.NET Core + EF Core
- Clean Architecture at app level (not enforced inside modules)
- Use `ModuleDbContext` directly in controllers for simple use cases
- Integration events:
  - Add to `Entity.Events`
  - Published via `SaveChangesInterceptor`

### Validation
- Prefer DataAnnotations over FluentValidation
- On validation failure:
  - Throw `ValidationException` in RFC7807 format

---

## Client (Multi-Clients)

### API Types (Critical Workflow)
- Source of truth:
  `shared/api/lib/openapi-types.ts`

- If types are missing/outdated:
  1. Run backend:
     ```bash
     dotnet run --project src/AppHost/AppHost.csproj
     ```
  2. Generate types in another terminal:
     ```bash
     openapi-typescript http://localhost:5265/openapi/v1.json -o src/Clients/shared/api/lib/types.ts
     ```
  3. Update exports in:
     `shared/api/api-types.ts`

---

## 🖥 Admin App

### Stack
- Vite + React + TypeScript
- Tailwind + Shadcn UI
- TanStack Query + openapi-react-query
- React Hook Form
- Zustand

### Core Files
- `appFetch.ts`
- `api-client.ts`

---

## 🛍 Shop Client
- Upcoming