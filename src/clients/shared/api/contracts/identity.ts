import type {
  ForgotPasswordRequest,
  InfoRequest,
  InfoResponse,
  LoginQuery,
  LoginRequest,
  LoginResponse,
  RefreshRequest,
  RefreshResponse,
  RegisterRequest,
  ResendConfirmationEmailRequest,
  ResetPasswordRequest,
  TwoFactorRequest,
  TwoFactorResponse,
  UpdateInfoResponse,
  UserInfo,
} from "../types/identity";

export interface IIdentityClient {
  // Request alias is generated from ASP.NET Identity OpenAPI in src/clients/shared/api/types/identity.ts.
  register(input: RegisterRequest): Promise<void>;

  // Request/response aliases are generated from ASP.NET Identity OpenAPI in src/clients/shared/api/types/identity.ts.
  login(input: LoginRequest, query?: LoginQuery): Promise<LoginResponse>;

  // Request/response aliases are generated from ASP.NET Identity OpenAPI in src/clients/shared/api/types/identity.ts.
  refresh(input: RefreshRequest): Promise<RefreshResponse>;

  // Request alias is generated from ASP.NET Identity OpenAPI in src/clients/shared/api/types/identity.ts.
  resendConfirmationEmail(input: ResendConfirmationEmailRequest): Promise<void>;

  // Request alias is generated from ASP.NET Identity OpenAPI in src/clients/shared/api/types/identity.ts.
  forgotPassword(input: ForgotPasswordRequest): Promise<void>;

  // Request alias is generated from ASP.NET Identity OpenAPI in src/clients/shared/api/types/identity.ts.
  resetPassword(input: ResetPasswordRequest): Promise<void>;

  // Response: src/Modules/Identity/Api/MinimalApi.cs
  getCurrentUser(): Promise<UserInfo>;

  // Request/response aliases are generated from ASP.NET Identity OpenAPI in src/clients/shared/api/types/identity.ts.
  updateTwoFactor(input: TwoFactorRequest): Promise<TwoFactorResponse>;

  // Response alias is generated from ASP.NET Identity OpenAPI in src/clients/shared/api/types/identity.ts.
  getInfo(): Promise<InfoResponse>;

  // Request/response aliases are generated from ASP.NET Identity OpenAPI in src/clients/shared/api/types/identity.ts.
  updateInfo(input: InfoRequest): Promise<UpdateInfoResponse>;
}
