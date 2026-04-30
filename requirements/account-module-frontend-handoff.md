# Account Module Frontend Handoff

## Summary
Claude should use the `Account` module for domain profiles, addresses, tenant-admin account management, and admin realtime notifications. `Identity` remains responsible for login, tokens, passwords, roles, and claims.

## Shared Types
- Import Account API aliases from `src/clients/shared/api/api-types.ts`.
- Account-specific exports are in `src/clients/shared/api/account-types.ts`.
- Available constants:
  - `accountTypes`: `Customer`, `TenantAdmin`, `TenantStaff`
  - `accountStatuses`: `Active`, `Suspended`, `Archived`

## Request And Response Types
- `GET /api/Account/profile`
  - Response: `AccountProfileResponse`.
- `PUT /api/Account/profile`
  - Request: `UpdateAccountProfileRequest`.
  - Response: `UpdateAccountProfileResponse`.
- `GET /api/Account/addresses`
  - Response: `ListAccountAddressesResponse`.
- `POST /api/Account/addresses`
  - Request: `SaveAccountAddressRequest`.
  - Response: `CreateAccountAddressResponse`.
- `PUT /api/Account/addresses/{id}`
  - Path params: `UpdateAccountAddressParams`.
  - Request: `UpdateAccountAddressRequest`.
  - Response: `UpdateAccountAddressResponse`.
- `DELETE /api/Account/addresses/{id}`
  - Path params: `DeleteAccountAddressParams`.
  - Response: `DeleteAccountAddressResponse`.
- `GET /api/Account/admin/profiles`
  - Query: `ListAdminAccountProfilesQuery`.
  - Response: `ListAdminAccountProfilesResponse`.
- `GET /api/Account/admin/profiles/{id}`
  - Path params: `GetAdminAccountProfileByIdParams`.
  - Response: `GetAdminAccountProfileByIdResponse`.
- `PUT /api/Account/admin/profiles/{id}`
  - Path params: `UpdateAdminAccountProfileParams`.
  - Request: `AdminUpdateAccountProfileRequest`.
  - Response: `UpdateAdminAccountProfileResponse`.
- Hub `/hubs/notifications`
  - Server event: `NotificationReceived`.
  - Payload: no shared alias yet; use the `AdminOrderPlacedNotification` shape below.

## Type Properties

`AccountType` values:
- `Customer`
- `TenantAdmin`
- `TenantStaff`

`AccountStatus` values:
- `Active`
- `Suspended`
- `Archived`

`UpdateAccountProfileRequest`:
- `displayName?: string | null`
- `email?: string | null`
- `phoneNumber?: string | null`
- `avatarUrl?: string | null`

`AdminUpdateAccountProfileRequest`:
- `displayName?: string | null`
- `email?: string | null`
- `phoneNumber?: string | null`
- `avatarUrl?: string | null`
- `type?: AccountType | null`
- `status?: AccountStatus | null`

`AccountProfileResponse`:
- `id: number`
- `identityUserId: string`
- `type: AccountType`
- `displayName: string`
- `email: string`
- `phoneNumber: string`
- `avatarUrl: string`
- `status: AccountStatus`
- `created: string`
- `lastModified: string`
- `addresses: AccountAddressResponse[]`

`SaveAccountAddressRequest`, `CreateAccountAddressResponse`, and `UpdateAccountAddressResponse` address fields:
- `ownerName: string`
- `type: string`
- `phoneNumber: string`
- `email: string`
- `country: string`
- `state: string`
- `city: string`
- `postalCode: string`
- `line1: string`
- `line2: string`
- `isDefaultShipping: boolean`
- `isDefaultBilling: boolean`

`AccountAddressResponse` extra fields:
- `id: number`
- `accountProfileId: number`

`UpdateAccountAddressParams` and `DeleteAccountAddressParams`:
- `id: number`

`ListAdminAccountProfilesQuery`:
- `pageNumber?: number`
- `pageSize?: number`
- `search?: string | null`
- `type?: AccountType | null`
- `status?: AccountStatus | null`
- `sortBy?: string | null`
- `sortDirection?: string | null`

`ListAdminAccountProfilesResponse`:
- `items: AccountProfileResponse[]`
- `pageNumber: number`
- `totalPages: number`
- `totalCount: number`
- `hasPreviousPage: boolean`
- `hasNextPage: boolean`

`GetAdminAccountProfileByIdParams` and `UpdateAdminAccountProfileParams`:
- `id: number`

`NotificationReceived` placed-order payload:
- `type: "OrderPlaced"`
- `orderId: number`
- `orderCode: string`
- `customerId?: string | null`
- `totalAmount: number`
- `currencyCode: string`
- `reservationId: number`
- `status: string`
- `createdAt: string`

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
