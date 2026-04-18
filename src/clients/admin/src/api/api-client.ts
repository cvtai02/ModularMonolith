import type { paths } from '@shared/api/lib/openapi-types'
import { appFetch } from '@/configs/appFetch';
import createFetchClient from "openapi-fetch";
import createClient from "openapi-react-query";

export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;
export const API_IDENTITY_URL = import.meta.env.VITE_API_IDENTITY_URL;

// base transport (no React). ignore this in most cases
export const apiClient = createFetchClient<paths>({
  baseUrl: API_BASE_URL,
  fetch: appFetch
})

// inside React
// openapi-react-query clients: a thin, type-safe wrapper around TanStack Query that lets you call API using your OpenAPI schema—with fully inferred types for data, error, and params, and an auto-generated query key based on [method, path, params]
export const tanstackQueryClient = createClient(apiClient)

// region: api client for identity module
export const identityFetchClient = createFetchClient<paths>({
    baseUrl: API_IDENTITY_URL,
    fetch: appFetch
})
export const identityTanstackClient = createClient(identityFetchClient);
// endregion
