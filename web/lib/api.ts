const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:4000";

type FetchOptions = RequestInit & {
  params?: Record<string, string>;
};

export class ApiError extends Error {
  status: number;
  code?: string;

  constructor(message: string, status: number, code?: string) {
    super(message);
    this.status = status;
    this.code = code;
  }
}

export async function apiFetch<T>(
  endpoint: string,
  options: FetchOptions = {}
): Promise<T> {
  const { params, ...fetchOptions } = options;

  let url = `${API_BASE_URL}${endpoint}`;
  if (params) {
    const searchParams = new URLSearchParams(params);
    url += `?${searchParams.toString()}`;
  }

  const response = await fetch(url, {
    ...fetchOptions,
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
      ...fetchOptions.headers,
    },
  });

  if (!response.ok) {
    const body = await response.json().catch(() => ({ error: "Request failed" }));
    const message = body.error || body.message || `HTTP ${response.status}`;

    // Handle auth errors with redirects (client-side only, skip in dev mode)
    if (typeof window !== "undefined" && process.env.NODE_ENV !== "development") {
      if (response.status === 401) {
        window.location.href = "/login";
      } else if (response.status === 403 && body.code === "COHORT_REQUIRED") {
        window.location.href = "/join";
      }
    }

    throw new ApiError(message, response.status, body.code);
  }

  return response.json();
}
