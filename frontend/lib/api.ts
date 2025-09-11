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

  if (!res.ok) {
    let errorMessage = "Request failed";
    try {
      const err = await res.json();
      errorMessage = err.message || errorMessage;
    } catch {}
    throw new Error(errorMessage);
  }

  return res.json();
}
