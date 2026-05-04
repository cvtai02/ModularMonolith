# Admin View And Add Customers Backend Plan

## Goal

Admins should be able to view customers and add a new customer record from the admin experience.

The Account module already exposes admin profile listing, filtering, detail, and update APIs. This work should preserve those existing view APIs and add an admin create-customer capability.

## API Capability

Reuse existing admin view APIs:

- list admin account profiles
- get admin account profile by id

Add a new admin-only customer creation API under the Account module.

The create response should return the same `AccountProfileResponse` shape used by existing admin profile APIs so the frontend can navigate to detail or insert the new row into the list.

## Customer Create Shape

The admin create-customer request should include:

- display name
- email
- phone number
- avatar URL
- status
- optional identity user id

The created profile should have:

- `Type = Customer`
- `Status = Active` by default when status is not supplied

If `IdentityUserId` is omitted, the backend can create a customer profile without an identity link for admin/order workflows. If a login-capable customer account is required later, that should be handled by a separate Identity module API or integration boundary because Account does not currently own Identity user creation.

## Affected Backend Boundaries

Primary module:

- `src/Modules/Account/`

Expected backend updates:

- add create request DTO under `src/Modules/Account/DTOs/AccountProfiles/`
- add create use case under `src/Modules/Account/Core/Usecases/`
- add admin `POST /api/Account/admin/profiles` endpoint in `AccountProfileController.cs`
- register the use case in `src/Modules/Account/Module.cs`
- update `src/Modules/Account/Api/api.md` with concise endpoint summary

Shared contract updates are expected under:

- `src/clients/shared/api/types/account.ts`
- `src/clients/shared/api/contracts/account.ts`
- `src/clients/shared/api/clients/account.ts`

Do not edit `src/clients/shared/api/lib/`.

## Validation Behavior

Admin create customer should validate:

- request body exists
- email is required
- display name is optional but should normalize whitespace
- phone number is optional but should normalize whitespace
- avatar URL is optional and should normalize whitespace
- identity user id is optional but, when provided, must be unique among active account profiles in the tenant
- status, when provided, must be a valid `AccountStatus`

If duplicate identity user id is detected, return a validation error on `IdentityUserId`.

## Frontend Handoff

Write a Claude-facing handoff under `requirements/frontend-handoff/`.

The handoff should include:

- existing client methods to view customers
- new client method to create a customer
- exact request/response aliases from `src/clients/shared/api/types/account.ts`
- validation and behavior notes
- instruction to move the handoff to `requirements/frontend-handoff/done/` after implementation

## Migration Impact

No schema migration is expected because this uses the existing `AccountProfile` table.
