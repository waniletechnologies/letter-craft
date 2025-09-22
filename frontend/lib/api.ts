export async function apiFetch(endpoint: string, options: RequestInit = {}) {
  const baseUrl = process.env.NEXT_PUBLIC_BACKEND_URL + "/api";

  // Don't set Content-Type for FormData - let browser set it
  const headers = new Headers();
  if (!(options.body instanceof FormData)) {
    headers.set("Content-Type", "application/json");
  }

  if (options.headers) {
    Object.entries(options.headers).forEach(([key, value]) => {
      headers.set(key, value as string);
    });
  }

  const res = await fetch(`${baseUrl}${endpoint}`, {
    ...options,
    headers,
    credentials: "include",
  });

  const responseData = await res.json();

  if (!res.ok) {
    throw new Error(
      JSON.stringify({
        message: responseData.message || "Request failed",
        errors: responseData.errors || [],
        status: res.status,
      })
    );
  }

  return responseData;
}
