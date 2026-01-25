export const API_BASE_URL = "/api"; // Use local Next.js proxy

export class ApiError extends Error {
  constructor(
    public status: number,
    public message: string,
    public data?: any,
  ) {
    super(message);
  }
}

async function handleResponse<T>(response: Response): Promise<T> {
  const data = await response.json();

  if (!response.ok) {
    throw new ApiError(
      response.status,
      data.message || "An unexpected error occurred",
      data,
    );
  }

  return data as T;
}

export const api = {
  get: async <T>(endpoint: string, headers: HeadersInit = {}): Promise<T> => {
    const res = await fetch(`${API_BASE_URL}${endpoint}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        ...headers,
      },
    });
    return handleResponse<T>(res);
  },

  post: async <T>(
    endpoint: string,
    body: any,
    headers: HeadersInit = {},
  ): Promise<T> => {
    const res = await fetch(`${API_BASE_URL}${endpoint}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...headers,
      },
      body: JSON.stringify(body),
    });
    return handleResponse<T>(res);
  },

  put: async <T>(
    endpoint: string,
    body: any,
    headers: HeadersInit = {},
  ): Promise<T> => {
    const res = await fetch(`${API_BASE_URL}${endpoint}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        ...headers,
      },
      body: JSON.stringify(body),
    });
    return handleResponse<T>(res);
  },

  delete: async <T>(
    endpoint: string,
    headers: HeadersInit = {},
  ): Promise<T> => {
    const res = await fetch(`${API_BASE_URL}${endpoint}`, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
        ...headers,
      },
    });
    return handleResponse<T>(res);
  },
};
