// lib/auth.ts
import { apiFetch } from "./api";

export async function loginUser(email: string, password: string) {
  return apiFetch("/auth/login", {
    method: "POST",
    body: JSON.stringify({ email, password }),
  });
}

export async function getCurrentUser() {
  return apiFetch("/auth/me");
}

export async function requestPasswordReset(email: string) {
  return apiFetch("/auth/request-reset", {
    method: "POST",
    body: JSON.stringify({ email }),
  });
}

export async function verifyResetCode(email: string, code: string) {
  return apiFetch("/auth/verify-code", {
    method: "POST",
    body: JSON.stringify({ email, code }),
  });
}

export async function resetPassword(
  email: string,
  code: string,
  newPassword: string
) {
  return apiFetch("/auth/reset-password", {
    method: "POST",
    body: JSON.stringify({ email, code, newPassword }),
  });
}
