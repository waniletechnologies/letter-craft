import { useState, useEffect } from "react";
import { fetchStoredCreditReport } from "@/lib/creditReportApi";
import { transformCreditReportData } from "@/lib/dataTransform";

export const useCreditReport = (email?: string) => {
  const [data, setData] = useState<any>(null);
  const [userName, setUserName] = useState("Client");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!email) return;

    let cancelled = false; // avoid state updates if unmounted
    const load = async () => {
      setLoading(true);
      setError(null);

      try {
        const decodedEmail = decodeURIComponent(email);
        const response = await fetchStoredCreditReport(decodedEmail);

        if (!response.success || !response.data) {
          throw new Error(response.message || "Failed to load credit report.");
        }

        const transformed = transformCreditReportData(response.data);
        if (!cancelled) setData(transformed);

        const report = response.data;
        const nameObj = report.personalInfo?.Experian?.names?.[0];
        if (nameObj && (nameObj.first || nameObj.last)) {
          setUserName(`${nameObj.first ?? ""} ${nameObj.last ?? ""}`.trim());
        }
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : "An unknown error occurred.");
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    load();
    return () => {
      cancelled = true;
    };
  }, [email]);

  return { data, userName, loading, error };
};
