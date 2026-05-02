import type {
  AccountProfileResponse,
  AdminUpdateAccountProfileRequest,
  CreateAccountAddressResponse,
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

export * from "../types/account"

export interface IAccountClient {
  // Response: src/Modules/Account/DTOs/AccountProfiles/AccountProfileResponse.cs
  getMe(): Promise<AccountProfileResponse>;

  // Request: src/Modules/Account/DTOs/AccountProfiles/UpdateAccountProfileRequest.cs
  // Response: src/Modules/Account/DTOs/AccountProfiles/AccountProfileResponse.cs
  updateMe(input: UpdateAccountProfileRequest): Promise<UpdateAccountProfileResponse>;

  // Item response: src/Modules/Account/DTOs/AccountAddresses/AccountAddressResponse.cs
  // Wrapper response is generated in src/clients/shared/api/types/account.ts.
  listMyAddresses(): Promise<ListAccountAddressesResponse>;

  // Request: src/Modules/Account/DTOs/AccountAddresses/SaveAccountAddressRequest.cs
  // Response: src/Modules/Account/DTOs/AccountAddresses/AccountAddressResponse.cs
  createMyAddress(input: SaveAccountAddressRequest): Promise<CreateAccountAddressResponse>;

  // Request: src/Modules/Account/DTOs/AccountAddresses/SaveAccountAddressRequest.cs
  // Response: src/Modules/Account/DTOs/AccountAddresses/AccountAddressResponse.cs
  updateMyAddress(id: number, input: UpdateAccountAddressRequest): Promise<UpdateAccountAddressResponse>;

  // No response body. Alias is generated in src/clients/shared/api/types/account.ts.
  deleteMyAddress(id: number): Promise<DeleteAccountAddressResponse>;

  // Query: src/Modules/Account/DTOs/AccountProfiles/ListAccountProfilesRequest.cs
  // Item response: src/Modules/Account/DTOs/AccountProfiles/AccountProfileResponse.cs
  // Wrapper response is generated in src/clients/shared/api/types/account.ts.
  listAdminProfiles(query?: ListAdminAccountProfilesQuery): Promise<ListAdminAccountProfilesResponse>;

  // Response: src/Modules/Account/DTOs/AccountProfiles/AccountProfileResponse.cs
  getAdminProfileById(id: number): Promise<GetAdminAccountProfileByIdResponse>;

  // Request: src/Modules/Account/DTOs/AccountProfiles/AdminUpdateAccountProfileRequest.cs
  // Response: src/Modules/Account/DTOs/AccountProfiles/AccountProfileResponse.cs
  updateAdminProfile(id: number, input: AdminUpdateAccountProfileRequest): Promise<UpdateAdminAccountProfileResponse>;
}
