# Account Module Summary Flow

## Status
Implemented and moved to `requirements/done/`.

## Flow
- `Identity` owns login, tokens, passwords, roles, and claims.
- `Account` owns profile data, account type/status, addresses, and admin notification hub usage.
- Current user flow:
  - User authenticates through `Identity`.
  - Frontend calls `GET /api/Account/profile`.
  - Backend creates the account profile on first access if missing.
  - User can update profile and manage addresses through Account endpoints.
- Tenant admin flow:
  - Tenant admin uses profile list/detail/update endpoints.
  - Endpoints require `TenantAdminUp`.
  - Admin can search/filter accounts by query params.
- Notification flow:
  - Tenant admin connects to `/hubs/notifications`.
  - Backend emits `NotificationReceived` for placed order notifications.
  - Frontend appends events to an admin notification tray and can link to order detail.

## Contract Pointers
- API docs: `src/Modules/Account/Api/api.md`
- Shared frontend aliases: `src/clients/shared/api/account-types.ts`
- DTOs: `src/Modules/Account/DTOs`
