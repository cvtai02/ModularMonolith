# Admin View And Add Customers Frontend Handoff

## Completed

- `ROUTES` extended with `customerNew` and `customerDetail(id)`.
- `pages/customers/index.tsx` — paginated list filtered to `Type: Customer`; search + status filter; row click navigates to detail.
- `pages/customers/add.tsx` — create form with email (required), displayName, phoneNumber, status select, identityUserId; maps validation errors to fields; on success navigates to detail and invalidates `admin-customers` query.
- `pages/customers/detail.tsx` — profile card with avatar, status badge, identity key, dates; addresses list.
- `pages/customers/components/CustomerStatusBadge.tsx` — Active / Suspended / Archived badge.
- `routes.tsx` — routes registered for `/customers`, `/customers/new`, `/customers/:id`.

## Goal

Build admin customer viewing and customer creation using the shared Account API client.

Move this file to `requirements/frontend-handoff/done/` after frontend implementation.

## Shared API Contract

Use:

- `src/clients/shared/api/contracts/account.ts`
- `src/clients/shared/api/clients/account.ts`
- `src/clients/shared/api/types/account.ts`

Existing view methods:

- `listAdminProfiles(query?: ListAdminAccountProfilesQuery): Promise<ListAdminAccountProfilesResponse>`
- `getAdminProfileById(id: number): Promise<GetAdminAccountProfileByIdResponse>`
- `updateAdminProfile(id: number, input: AdminUpdateAccountProfileRequest): Promise<UpdateAdminAccountProfileResponse>`

New create method:

- `createAdminProfile(input: AdminCreateAccountProfileRequest): Promise<CreateAdminAccountProfileResponse>`

## Create Customer Request

Type alias:

```ts
export type AdminCreateAccountProfileRequest = UpdateAccountProfileRequest & {
    identityUserId?: string | null;
    status?: AccountStatus | null;
};
```

Frontend-facing properties:

```ts
{
    displayName?: string | null;
    email?: string | null;
    phoneNumber?: string | null;
    avatarUrl?: string | null;
    identityUserId?: string | null;
    status?: "Active" | "Suspended" | "Archived" | null;
}
```

`email` is required by backend validation.

If `identityUserId` is omitted, the backend creates a customer profile with a generated manual identity key like:

```text
manual-customer:<guid>
```

This supports admin/order workflows for customers who do not yet have a login account. Login-capable customer identity creation is not part of this API.

Created profiles always have:

- `type: "Customer"`
- `status: "Active"` unless another status is submitted

## Response

Create returns `AccountProfileResponse`, the same shape used by admin list/detail/update.

Use the returned profile to add the customer to the list or navigate to the profile detail screen.

## Validation Behavior

Backend validation:

- request body is required
- `email` is required
- `identityUserId`, when supplied, must not already belong to another active profile in the tenant

Show validation errors on the corresponding form fields.
