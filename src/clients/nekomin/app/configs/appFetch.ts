import { ApiError, ValidationError } from "@modular-monolith/clients-shared/api/contracts";

function getAccessToken(): string {
  if (typeof window === "undefined") return "";
  return localStorage.getItem("access_token") ?? "";
}

export const appFetch = async (
  input: RequestInfo | URL,
  init?: RequestInit
): Promise<Response> => {
  const response = await fetch(input, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${getAccessToken()}`,
      ...init?.headers,
    },
  });

  if (!response.ok) {
    throw await createApiError(response);
  }

  return response;
};

const createApiError = async (response: Response): Promise<ApiError> => {
  if (response.status < 400)
    return new ApiError(`Throw on ${response.status}`, response.status, "");

  const body = await response.clone().json().catch(() => null);

  if (response.status === 400) return new ValidationError(body);

  if (body?.title) return new ApiError(body.title, response.status, body.detail);

  return new ApiError("API call failed, check devtools", response.status, "");
};
