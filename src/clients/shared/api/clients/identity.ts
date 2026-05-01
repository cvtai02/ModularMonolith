import createFetchClient, { type Client } from "openapi-fetch";
import type { paths } from "../lib/openapi-types";
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
import type { IIdentityClient } from "../contracts/identity";
import type { Fetch } from "./shared";
import { requireData } from "./shared";

type OpenApiClient = Client<paths>;

export class IdentityClient implements IIdentityClient {
  private readonly client: OpenApiClient;

  constructor(fetch: Fetch, apiBaseUrl: string) {
    this.client = createFetchClient<paths>({ baseUrl: apiBaseUrl, fetch });
  }

  async register(input: RegisterRequest): Promise<void> {
    const { error } = await this.client.POST("/register", { body: input });
    if (error) throw error;
  }

  async login(input: LoginRequest, query?: LoginQuery): Promise<LoginResponse> {
    const { data, error } = await this.client.POST("/login", {
      params: { query },
      body: input,
    });
    if (error) throw error;
    return requireData(data, "Login response was empty.");
  }

  async refresh(input: RefreshRequest): Promise<RefreshResponse> {
    const { data, error } = await this.client.POST("/refresh", { body: input });
    if (error) throw error;
    return requireData(data, "Refresh response was empty.");
  }

  async resendConfirmationEmail(input: ResendConfirmationEmailRequest): Promise<void> {
    const { error } = await this.client.POST("/resendConfirmationEmail", { body: input });
    if (error) throw error;
  }

  async forgotPassword(input: ForgotPasswordRequest): Promise<void> {
    const { error } = await this.client.POST("/forgotPassword", { body: input });
    if (error) throw error;
  }

  async resetPassword(input: ResetPasswordRequest): Promise<void> {
    const { error } = await this.client.POST("/resetPassword", { body: input });
    if (error) throw error;
  }

  async getCurrentUser(): Promise<UserInfo> {
    const { data, error } = await this.client.GET("/me");
    if (error) throw error;
    return requireData(data, "Current user response was empty.");
  }

  async updateTwoFactor(input: TwoFactorRequest): Promise<TwoFactorResponse> {
    const { data, error } = await this.client.POST("/manage/2fa", { body: input });
    if (error) throw error;
    return requireData(data, "Two-factor response was empty.");
  }

  async getInfo(): Promise<InfoResponse> {
    const { data, error } = await this.client.GET("/manage/info");
    if (error) throw error;
    return requireData(data, "Info response was empty.");
  }

  async updateInfo(input: InfoRequest): Promise<UpdateInfoResponse> {
    const { data, error } = await this.client.POST("/manage/info", { body: input });
    if (error) throw error;
    return requireData(data, "Update info response was empty.");
  }
}
