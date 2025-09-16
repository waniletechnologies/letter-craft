export async function apiFetch(endpoint: string, options: RequestInit = {}) {
  const baseUrl = process.env.NEXT_PUBLIC_BACKEND_URL + "/api";

  const res = await fetch(`${baseUrl}${endpoint}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(options.headers || {}),
    },
    credentials: "include",
  });

  const responseData = await res.json();

  if (!res.ok) {
    // Preserve the entire error response structure
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
