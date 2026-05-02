import { ApiError, ValidationError } from "@shared/api/contracts/common-types";
import { useIdentityStore } from '@/stores/identity';

//override default fetch function to include API_INTERCEPTOR_CONFIG behavior
export const appFetch = async (input: RequestInfo | URL, init?: RequestInit): Promise<Response> => {
    const { accessToken } = useIdentityStore.getState();
    const response = await fetch(input, {
        ...init,
        headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${accessToken}`,
            ...init?.headers,
        },
    });
    if (!response.ok) {
        throw await createApiError(response);
    }
    return response;
};

const createApiError = async (response: Response): Promise<ApiError> => {
    if (response.status < 400) return new ApiError(`Throw on ${response.status}`, response.status, "");

    const body = await response.clone().json().catch(() => null);
    if (response.status == 400) {
        return new ValidationError(body);
    }
    if (body && body.title) {
        return new ApiError(body.title, response.status, body.detail);
    }

    return new ApiError("Failed API call return no title, check devtools", response.status, "");
}