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

export interface IAccountClient {
  getMe(): Promise<AccountProfileResponse>;
  updateMe(input: UpdateAccountProfileRequest): Promise<UpdateAccountProfileResponse>;

  listMyAddresses(): Promise<ListAccountAddressesResponse>;
  createMyAddress(input: SaveAccountAddressRequest): Promise<CreateAccountAddressResponse>;
  updateMyAddress(id: number, input: UpdateAccountAddressRequest): Promise<UpdateAccountAddressResponse>;
  deleteMyAddress(id: number): Promise<DeleteAccountAddressResponse>;

  listAdminProfiles(query?: ListAdminAccountProfilesQuery): Promise<ListAdminAccountProfilesResponse>;
  getAdminProfileById(id: number): Promise<GetAdminAccountProfileByIdResponse>;
  updateAdminProfile(id: number, input: AdminUpdateAccountProfileRequest): Promise<UpdateAdminAccountProfileResponse>;
}
