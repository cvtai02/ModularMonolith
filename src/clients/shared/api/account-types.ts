import type { paths } from "./lib/openapi-types";
import type { JsonRequestBody, JsonResponse, PathParams, QueryParams } from "./path-type-helpers";

type AccountPaths = paths; // do not export this
type Operation<TPath extends string, TMethod extends string> =
    TPath extends keyof AccountPaths
        ? TMethod extends keyof AccountPaths[TPath]
            ? AccountPaths[TPath][TMethod]
            : never
        : never;

type GetMyAccountProfileOperation =
    Operation<"/api/Account/profile", "get">;
type UpdateMyAccountProfileOperation =
    Operation<"/api/Account/profile", "put">;
type ListMyAccountAddressesOperation =
    Operation<"/api/Account/addresses", "get">;
type CreateMyAccountAddressOperation =
    Operation<"/api/Account/addresses", "post">;
type UpdateMyAccountAddressOperation =
    Operation<"/api/Account/addresses/{id}", "put">;
type DeleteMyAccountAddressOperation =
    Operation<"/api/Account/addresses/{id}", "delete">;
type ListAdminAccountProfilesOperation =
    Operation<"/api/Account/admin/profiles", "get">;
type GetAdminAccountProfileByIdOperation =
    Operation<"/api/Account/admin/profiles/{id}", "get">;
type UpdateAdminAccountProfileOperation =
    Operation<"/api/Account/admin/profiles/{id}", "put">;

export const accountTypes = ["Customer", "TenantAdmin", "TenantStaff"] as const;
export type AccountType = typeof accountTypes[number];

export const accountStatuses = ["Active", "Suspended", "Archived"] as const;
export type AccountStatus = typeof accountStatuses[number];

// 200 OK
export type AccountProfileResponse =
    JsonResponse<GetMyAccountProfileOperation, 200>;
export type UpdateAccountProfileRequest =
    JsonRequestBody<UpdateMyAccountProfileOperation>;
// 200 OK
export type UpdateAccountProfileResponse =
    JsonResponse<UpdateMyAccountProfileOperation, 200>;

// 200 OK
export type ListAccountAddressesResponse =
    JsonResponse<ListMyAccountAddressesOperation, 200>;
export type SaveAccountAddressRequest =
    JsonRequestBody<CreateMyAccountAddressOperation>;
// 200 OK
export type CreateAccountAddressResponse =
    JsonResponse<CreateMyAccountAddressOperation, 200>;
export type UpdateAccountAddressParams =
    PathParams<UpdateMyAccountAddressOperation>;
export type UpdateAccountAddressRequest =
    JsonRequestBody<UpdateMyAccountAddressOperation>;
// 200 OK
export type UpdateAccountAddressResponse =
    JsonResponse<UpdateMyAccountAddressOperation, 200>;
export type DeleteAccountAddressParams =
    PathParams<DeleteMyAccountAddressOperation>;
// 204 No Content
export type DeleteAccountAddressResponse =
    JsonResponse<DeleteMyAccountAddressOperation, 204>;

export type ListAdminAccountProfilesQuery =
    QueryParams<ListAdminAccountProfilesOperation>;
// 200 OK
export type ListAdminAccountProfilesResponse =
    JsonResponse<ListAdminAccountProfilesOperation, 200>;
export type GetAdminAccountProfileByIdParams =
    PathParams<GetAdminAccountProfileByIdOperation>;
// 200 OK
export type GetAdminAccountProfileByIdResponse =
    JsonResponse<GetAdminAccountProfileByIdOperation, 200>;
export type UpdateAdminAccountProfileParams =
    PathParams<UpdateAdminAccountProfileOperation>;
export type AdminUpdateAccountProfileRequest =
    JsonRequestBody<UpdateAdminAccountProfileOperation>;
// 200 OK
export type UpdateAdminAccountProfileResponse =
    JsonResponse<UpdateAdminAccountProfileOperation, 200>;
