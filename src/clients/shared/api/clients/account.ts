import createFetchClient, { type Client } from "openapi-fetch";
import type { paths } from "../lib/openapi-types";
import type {
  AccountProfileResponse,
  AdminCreateAccountProfileRequest,
  AdminUpdateAccountProfileRequest,
  CreateAccountAddressResponse,
  CreateAdminAccountProfileResponse,
  DeleteAccountAddressResponse,
  GetAdminAccountProfileByIdResponse,
  ListAccountAddressesResponse,
  ListAdminAccountProfilesQuery,
  ListAdminAccountProfilesResponse,
  SaveAccountAddressRequest,
  UpdateAccountAddressRequest,
  UpdateAccountAddressResponse,
  UpdateAccountProfileRequest,
  UpdateAccountProfileResponse,
  UpdateAdminAccountProfileResponse,
} from "../types/account";
import type { IAccountClient } from "../contracts/account";
import type { Fetch } from "./shared";
import { requireData } from "./shared";

type OpenApiClient = Client<paths>;

export class AccountClient implements IAccountClient {
  private readonly client: OpenApiClient;
  private readonly fetch: Fetch;
  private readonly apiBaseUrl: string;

  constructor(fetch: Fetch, apiBaseUrl: string) {
    this.fetch = fetch;
    this.apiBaseUrl = apiBaseUrl.replace(/\/$/, "");
    this.client = createFetchClient<paths>({ baseUrl: apiBaseUrl, fetch });
  }

  async getMe(): Promise<AccountProfileResponse> {
    const { data, error } = await this.client.GET("/api/Account/profile");
    if (error) throw error;
    return requireData(data, "Account profile response was empty.");
  }

  async updateMe(input: UpdateAccountProfileRequest): Promise<UpdateAccountProfileResponse> {
    const { data, error } = await this.client.PUT("/api/Account/profile", { body: input });
    if (error) throw error;
    return requireData(data, "Update account profile response was empty.");
  }

  async listMyAddresses(): Promise<ListAccountAddressesResponse> {
    const { data, error } = await this.client.GET("/api/Account/addresses");
    if (error) throw error;
    return requireData(data, "Account addresses response was empty.");
  }

  async createMyAddress(input: SaveAccountAddressRequest): Promise<CreateAccountAddressResponse> {
    const { data, error } = await this.client.POST("/api/Account/addresses", { body: input });
    if (error) throw error;
    return requireData(data, "Create account address response was empty.");
  }

  async updateMyAddress(id: number, input: UpdateAccountAddressRequest): Promise<UpdateAccountAddressResponse> {
    const { data, error } = await this.client.PUT("/api/Account/addresses/{id}", {
      params: { path: { id } },
      body: input,
    });
    if (error) throw error;
    return requireData(data, "Update account address response was empty.");
  }

  async deleteMyAddress(id: number): Promise<DeleteAccountAddressResponse> {
    const { error } = await this.client.DELETE("/api/Account/addresses/{id}", {
      params: { path: { id } },
    });
    if (error) throw error;
    return undefined as DeleteAccountAddressResponse;
  }

  async listAdminProfiles(query?: ListAdminAccountProfilesQuery): Promise<ListAdminAccountProfilesResponse> {
    const { data, error } = await this.client.GET("/api/Account/admin/profiles", {
      params: { query },
    });
    if (error) throw error;
    return requireData(data, "Admin account profiles response was empty.");
  }

  async createAdminProfile(input: AdminCreateAccountProfileRequest): Promise<CreateAdminAccountProfileResponse> {
    return this.requestJson<CreateAdminAccountProfileResponse>(
      "/api/Account/admin/profiles",
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(input),
      },
      "Create admin account profile response was empty.",
    );
  }

  async getAdminProfileById(id: number): Promise<GetAdminAccountProfileByIdResponse> {
    const { data, error } = await this.client.GET("/api/Account/admin/profiles/{id}", {
      params: { path: { id } },
    });
    if (error) throw error;
    return requireData(data, "Admin account profile response was empty.");
  }

  async updateAdminProfile(
    id: number,
    input: AdminUpdateAccountProfileRequest,
  ): Promise<UpdateAdminAccountProfileResponse> {
    const { data, error } = await this.client.PUT("/api/Account/admin/profiles/{id}", {
      params: { path: { id } },
      body: input,
    });
    if (error) throw error;
    return requireData(data, "Update admin account profile response was empty.");
  }

  private async requestJson<T>(path: string, init: RequestInit | undefined, emptyMessage: string): Promise<T> {
    const response = await this.fetch(`${this.apiBaseUrl}${path}`, init);
    if (!response.ok) {
      throw await this.readError(response);
    }

    if (response.status === 204) {
      return undefined as T;
    }

    const data = await response.json() as T | undefined;
    return requireData(data, emptyMessage);
  }

  private async readError(response: Response): Promise<unknown> {
    const contentType = response.headers.get("content-type") ?? "";
    if (contentType.includes("application/json")) {
      return await response.json();
    }

    return new Error(await response.text());
  }
}
