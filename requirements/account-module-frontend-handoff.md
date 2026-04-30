# Account Module Frontend Handoff

## Summary
Claude should use the `Account` module for domain profiles, addresses, tenant-admin account management, and admin realtime notifications. `Identity` remains responsible for login, tokens, passwords, roles, and claims.

## Shared Types
- Import Account API aliases from `src/clients/shared/api/api-types.ts`.
- Account-specific exports are in `src/clients/shared/api/account-types.ts`.
- Available constants:
  - `accountTypes`: `Customer`, `TenantAdmin`, `TenantStaff`
  - `accountStatuses`: `Active`, `Suspended`, `Archived`

## Current User Profile
- `GET /api/Account/profile`
  - Auth required.
  - Creates the account profile on first access for the authenticated Identity user.
  - Use for customer, tenant admin, and staff profile pages.
- `PUT /api/Account/profile`
  - Auth required.
  - Request: `displayName`, `email`, `phoneNumber`, `avatarUrl`.
  - Updates only the current user's profile fields.

## Current User Addresses
- `GET /api/Account/addresses`
  - Auth required.
  - Returns current user's active addresses.
- `POST /api/Account/addresses`
  - Auth required.
  - Creates address for current user.
- `PUT /api/Account/addresses/{id}`
  - Auth required.
  - Updates only current user's address.
- `DELETE /api/Account/addresses/{id}`
  - Auth required.
  - Soft deletes only current user's address.
- Address request fields:
  - `ownerName`, `type`, `phoneNumber`, `email`, `country`, `state`, `city`, `postalCode`, `line1`, `line2`, `isDefaultShipping`, `isDefaultBilling`.
- Required address fields:
  - `ownerName`, `phoneNumber`, `country`, `line1`.

## Tenant Admin Account Management
- `GET /api/Account/admin/profiles`
  - Requires `TenantAdminUp`.
  - Supports `pageNumber`, `pageSize`, `search`, `type`, `status`, `sortBy`, `sortDirection`.
- `GET /api/Account/admin/profiles/{id}`
  - Requires `TenantAdminUp`.
- `PUT /api/Account/admin/profiles/{id}`
  - Requires `TenantAdminUp`.
  - Can update profile fields plus `type` and `status`.

## Admin Notification Hub
- Hub URL: `/hubs/notifications`
- Auth: `TenantAdminUp` required.
- Listen for server event: `NotificationReceived`.
- Current notification payload for placed orders:
```json
{
  "type": "OrderPlaced",
  "orderId": 1,
  "orderCode": "ORD-20260430-ABCDEFGHIJ",
  "customerId": "identity-user-id",
  "totalAmount": 120000,
  "currencyCode": "VND",
  "reservationId": 10,
  "status": "Placed",
  "createdAt": "2026-04-30T12:00:00+00:00"
}
```

## UI Recommendations
- Customer/staff/admin profile screens should call `GET /api/Account/profile` during load and render empty strings as missing values.
- Address management should treat `isDefaultShipping` and `isDefaultBilling` as mutually unique per current user; backend clears other defaults when a new default is saved.
- Tenant admin profile list should be a dense operational table with search/type/status filters.
- Admin notification UI should connect once after tenant admin authentication, append `NotificationReceived` events to a notification tray, and deep-link `OrderPlaced` notifications to the order detail page.

## Backend Caveats
- The OpenAPI generated file may need regeneration before all Account operation aliases resolve to concrete response types.
- Do not read or edit `src/clients/admin` from Codex; Claude owns frontend implementation.
