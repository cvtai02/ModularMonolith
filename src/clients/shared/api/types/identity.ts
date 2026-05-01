import type { paths } from "../lib/openapi-types";
import type { JsonRequestBody, JsonResponse, QueryParams } from "./path-type-helpers";

// -- API Types --
type IdentityPaths = paths; // do not export this

type RegisterOperation = IdentityPaths["/register"]["post"];
type LoginOperation = IdentityPaths["/login"]["post"];
type RefreshOperation = IdentityPaths["/refresh"]["post"];
type ResendConfirmationEmailOperation = IdentityPaths["/resendConfirmationEmail"]["post"];
type ForgotPasswordOperation = IdentityPaths["/forgotPassword"]["post"];
type ResetPasswordOperation = IdentityPaths["/resetPassword"]["post"];
type GetMeOperation = IdentityPaths["/me"]["get"];
type TwoFactorOperation = IdentityPaths["/manage/2fa"]["post"];
type GetInfoOperation = IdentityPaths["/manage/info"]["get"];
type UpdateInfoOperation = IdentityPaths["/manage/info"]["post"];
type SeedAdminOperation = IdentityPaths["/api/setup/seed-admin"]["post"];
type SeedRolesOperation = IdentityPaths["/api/setup/seed-roles"]["post"];

export type RegisterRequest = JsonRequestBody<RegisterOperation>;

export type LoginRequest = JsonRequestBody<LoginOperation>;
export type LoginQuery = QueryParams<LoginOperation>;
// 200 OK
export type LoginResponse = JsonResponse<LoginOperation>;

export type RefreshRequest = JsonRequestBody<RefreshOperation>;
// 200 OK
export type RefreshResponse = JsonResponse<RefreshOperation>;

export type ResendConfirmationEmailRequest =
    JsonRequestBody<ResendConfirmationEmailOperation>;

export type ForgotPasswordRequest = JsonRequestBody<ForgotPasswordOperation>;
export type ResetPasswordRequest = JsonRequestBody<ResetPasswordOperation>;

// 200 OK
export type UserInfo = JsonResponse<GetMeOperation>;

export type TwoFactorRequest = JsonRequestBody<TwoFactorOperation>;
// 200 OK
export type TwoFactorResponse = JsonResponse<TwoFactorOperation>;

// 200 OK
export type InfoResponse = JsonResponse<GetInfoOperation>;
export type InfoRequest = JsonRequestBody<UpdateInfoOperation>;
// 200 OK
export type UpdateInfoResponse = JsonResponse<UpdateInfoOperation>;

export type AdminAccountInput = JsonRequestBody<SeedAdminOperation>;
// 200 OK
export type SeedRolesResponse = JsonResponse<SeedRolesOperation>;
