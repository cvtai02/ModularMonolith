export type Fetch = (input: RequestInfo | URL, init?: RequestInit) => Promise<Response>;

export function requireData<T>(data: T | undefined, message: string): T {
  if (data === undefined) {
    throw new Error(message);
  }

  return data;
}
