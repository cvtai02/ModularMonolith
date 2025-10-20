import type { paths } from '@shared/api/lib/openapi-types'
import { appFetch } from '@/configs/appFetch';
import createFetchClient from "openapi-fetch";
import createClient from "openapi-react-query";


export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;
export const API_IDENTITY_URL = import.meta.env.VITE_API_IDENTITY_URL;

export const fetchClient = createFetchClient<paths>({
    baseUrl: API_BASE_URL,
    fetch: appFetch
})
export const tanstackClient = createClient(fetchClient);

export const identityFetchClient = createFetchClient<paths>({
    baseUrl: API_IDENTITY_URL,
    fetch: appFetch
})

export const identityTanstackClient = createClient(identityFetchClient);
