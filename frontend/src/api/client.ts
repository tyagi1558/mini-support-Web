const baseUrl = import.meta.env.VITE_API_URL ?? "/api";

export interface ApiErrorResponse {
  success: false;
  error: {
    message: string;
    code?: string;
    details?: unknown;
  };
}

export async function apiRequest<T>(
  path: string,
  options: RequestInit = {},
): Promise<T> {
  const url = path.startsWith("http") ? path : `${baseUrl}${path}`;
  const response = await fetch(url, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...options.headers,
    },
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    const error = data as ApiErrorResponse;
    throw new Error(
      error?.error?.message ?? `Request failed: ${response.status}`,
    );
  }

  return data as T;
}
