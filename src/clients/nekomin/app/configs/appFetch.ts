import { ApiError, ValidationError } from "@modular-monolith/clients-shared/api/contracts";

const ACCESS_TOKEN_COOKIE = "access_token";

async function getAccessToken(): Promise<string> {
  if (typeof window === "undefined") {
    const { cookies } = await import("next/headers");
    const store = await cookies();
    return store.get(ACCESS_TOKEN_COOKIE)?.value ?? "";
  }
  const match = document.cookie.match(
    new RegExp(`(?:^|;\\s*)${ACCESS_TOKEN_COOKIE}=([^;]+)`)
  );
  return match ? decodeURIComponent(match[1]) : "";
}

export const appFetch = async (
  input: RequestInfo | URL,
  init?: RequestInit
): Promise<Response> => {
  const token = await getAccessToken();
  const headers = new Headers(init?.headers);

  if (token) headers.set("Authorization", `Bearer ${token}`);
  if (!headers.has("Content-Type") && !(init?.body instanceof FormData)) {
    headers.set("Content-Type", "application/json");
  }

  const response = await fetch(input, {
    ...init,
    headers,
    cache: init?.cache ?? "no-store",
  });

  if (!response.ok) throw await createApiError(response);
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
