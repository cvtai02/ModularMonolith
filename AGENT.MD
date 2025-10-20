# AGENTS.md

## 🧠 Purpose

This file defines how AI agents (Codex) should understand, modify, and extend this codebase.

The goal is **consistency, simplicity, and maintainability**.

---

## 🏗️ Architecture

* Backend: **ASP.NET Core + EF Core**
* Style: **Modular Monolith**
* Frontend: **React (TypeScript)**
* API: **REST (OpenAPI generated types)**

### Structure

* `src/AppHost` → entry point
* `src/Modules/*` → business modules (feature-based)
* `src/SharedKernel` → shared primitives
* `src/Infrastructure` → cross-cutting concerns
* `src/Clients` → frontend apps

---

## ⚙️ Backend Rules (.NET)

### Core Principles

1. **Keep everything simple**
2. **Do not over-engineer**
3. Prefer built-in features over libraries

---

### ❌ Forbidden Patterns

* Repository pattern
* Unit of Work abstraction
* Overuse of MediatR (only if already present)
* Complex domain layers for simple CRUD

---

### ✅ Data Access

* Use **EF Core DbContext directly**
* Access DbContext in controllers/services
* Keep queries simple and readable

```csharp
var product = await _db.Products.FindAsync(id);
```

---

### ✅ Validation

* Use **DataAnnotations**
* Return **RFC7807 (ProblemDetails)**

```csharp
return ValidationProblem(ModelState);
```

---

### ✅ Errors

* Always return **ProblemDetails**
* Never throw raw exceptions to client

---

### ✅ Migrations

* EF Core migrations must be:

  * Deterministic
  * Applied via CI/CD or startup

---

### ✅ Events (if used)

* Domain events stored in `Entity.Events`
* Keep lightweight (no complex event bus unless needed)

---

## 🌐 API Rules

* RESTful endpoints
* Use proper HTTP verbs
* Consistent routes:

```
GET    /api/products
GET    /api/products/{id}
POST   /api/products
PUT    /api/products/{id}
DELETE /api/products/{id}
```

---

## 🔄 API Types (Frontend Sync)

Types are generated from OpenAPI.

### Workflow

1. Run backend:

```bash
dotnet run --project src/AppHost/AppHost.csproj
```

2. Generate types:

```bash
openapi-typescript http://localhost:5265/openapi/v1.json -o src/Clients/shared/api/lib/types.ts
```

3. Re-export via:

```
shared/api/lib/api-types.ts
```

👉 Never manually write API DTO types.

---

## ⚛️ Frontend Rules (React)

### Core Principles

1. Keep components small
2. Prefer composition over abstraction
3. Avoid unnecessary state

---

### ✅ Data Fetching

* Use **TanStack Query**
* No manual fetch logic duplication

---

### ✅ State

* Server state → TanStack Query
* UI state → React state
* Avoid global state unless necessary

---

### ✅ API Usage

* Use generated API types
* No hardcoded response shapes

---

## 🧪 Testing

* Prefer **integration tests** over unit tests
* Focus on:

  * API behavior
  * Critical business logic

---

## 🚀 CI/CD Expectations

* Build only changed modules when possible
* Artifacts must be:

  * Self-contained
  * Deployable to VM or container

---

## 🐳 Deployment

* App can run:

  * Directly via `dotnet`
  * Or inside Docker

* Keep runtime simple:

  * No unnecessary services
  * Minimal dependencies

---

## 🧹 Code Style

* Use meaningful names
* Avoid deep abstractions
* Prefer readability over cleverness

---

## 🤖 Instructions for Codex

When working on this repo:

1. **Read existing code before writing anything**
2. Follow existing patterns strictly
3. Do not introduce new architecture without clear need
4. Minimize number of changed files
5. Ensure project builds successfully
6. Run and fix errors iteratively
7. Prefer editing existing code over adding new layers

---

## ⚠️ Anti-Overengineering Rule

If a solution feels “too clean” but adds complexity → reject it.

Prefer:

* 1 simple file
  over
* 5 abstracted layers

---

## ✅ Definition of Done

* Code builds
* API works
* Types are in sync
* No unnecessary complexity added
* Matches existing style

---

## 🔥 Guiding Philosophy

> Simple > Clean > Clever

---
