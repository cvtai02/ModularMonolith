import type {
  AdminAccountInput,
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
  SeedRolesResponse,
  TwoFactorRequest,
  TwoFactorResponse,
  UpdateInfoResponse,
  UserInfo,
} from "../types/identity";

export interface IIdentityClient {
  register(input: RegisterRequest): Promise<void>;
  login(input: LoginRequest, query?: LoginQuery): Promise<LoginResponse>;
  refresh(input: RefreshRequest): Promise<RefreshResponse>;
  resendConfirmationEmail(input: ResendConfirmationEmailRequest): Promise<void>;
  forgotPassword(input: ForgotPasswordRequest): Promise<void>;
  resetPassword(input: ResetPasswordRequest): Promise<void>;
  getCurrentUser(): Promise<UserInfo>;
  updateTwoFactor(input: TwoFactorRequest): Promise<TwoFactorResponse>;
  getInfo(): Promise<InfoResponse>;
  updateInfo(input: InfoRequest): Promise<UpdateInfoResponse>;
  seedAdmin(input: AdminAccountInput): Promise<void>;
  seedRoles(): Promise<SeedRolesResponse>;
}
