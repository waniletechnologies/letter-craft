"use client";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiFetch } from "../lib/api";

export type ClientPayload = {
  firstName: string;
  middleName?: string;
  lastName: string;
  suffix?: string;
  email: string;
  dateOfBirth: string;
  mailingAddress: string;
  city: string;
  state: string;
  zipCode: string;
  country?: string;
  phoneMobile: string;
  phoneAlternate?: string;
  phoneWork?: string;
  fax?: string;
  ssn: string;
  experianReport?: string;
  transunionFileNumber?: string;
  disputeScheduleDate?: string;
  disputeScheduleTime?: string;
};

export function useListClients(params?: {
  page?: number;
  limit?: number;
  search?: string;
  status?: string;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
}) {
  const query = new URLSearchParams();
  if (params?.page) query.set("page", String(params.page));
  if (params?.limit) query.set("limit", String(params.limit));
  if (params?.search) query.set("search", params.search);
  if (params?.status) query.set("status", params.status);
  if (params?.sortBy) query.set("sortBy", params.sortBy);
  if (params?.sortOrder) query.set("sortOrder", params.sortOrder);
  const qs = query.toString();
  return useQuery({
    queryKey: ["clients", params],
    queryFn: () => apiFetch(`/clients${qs ? `?${qs}` : ""}`),
  });
}

// hooks/clients.ts
export function useCreateClient() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (payload: ClientPayload) => {
      console.log("Sending payload:", payload);

      try {
        const response = await apiFetch("/clients", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(payload),
        });

        console.log("Success response:", response);
        return response;
      } catch (error) {
        console.log("Raw error from apiFetch:", error);
        // Re-throw so onError can handle it
        throw error;
      }
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["clients"] });
    },
  });
}

export function useGetClient(id?: string) {
  return useQuery({
    queryKey: ["client", id],
    queryFn: () => apiFetch(`/clients/${id}`),
    enabled: Boolean(id),
  });
}

export function useUpdateClient(id: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: Partial<ClientPayload>) =>
      apiFetch(`/clients/${id}`, {
        method: "PUT",
        body: JSON.stringify(payload),
      }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["clients"] });
      qc.invalidateQueries({ queryKey: ["client", id] });
    },
  });
}

export function useDeleteClient(id: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: () =>
      apiFetch(`/clients/${id}`, {
        method: "DELETE",
      }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["clients"] });
    },
  });
}

export function useUpdateClientStatus(id: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (status: "active" | "inactive" | "pending" | "archived") =>
      apiFetch(`/clients/${id}/status`, {
        method: "PATCH",
        body: JSON.stringify({ status }),
      }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["clients"] });
      qc.invalidateQueries({ queryKey: ["client", id] });
    },
  });
}

export function useClientStats() {
  return useQuery({
    queryKey: ["clientStats"],
    queryFn: () => apiFetch("/clients/statistics"),
  });
}

