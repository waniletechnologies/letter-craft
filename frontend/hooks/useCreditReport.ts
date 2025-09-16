import { useState, useEffect } from "react";
import { fetchStoredCreditReport } from "@/lib/creditReportApi";
import { transformCreditReportData } from "@/lib/dataTransform";

export const useCreditReport = (email?: string) => {
  const [data, setData] = useState<any>(null);
  const [userName, setUserName] = useState("Client");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // useCreditReport.ts
  useEffect(() => {
    if (!email) return;
    let cancelled = false;

    const fetchWithRetry = async (attempts = 5, delay = 1000) => {
      for (let i = 0; i < attempts; i++) {
        const res = await fetchStoredCreditReport(email);
        if (cancelled) return;

        if (res.success && res.data) {
          const transformed = transformCreditReportData(res.data);
          setData(transformed);

          // extract name
          const nameObj = res.data.personalInfo?.Experian?.names?.[0];
          if (nameObj) {
            setUserName(`${nameObj.first ?? ""} ${nameObj.last ?? ""}`.trim());
          }
          setError(null);
          return;
        }

        // wait and retry if report not found
        await new Promise((resolve) => setTimeout(resolve, delay));
      }
      if (!cancelled) setError("Credit report not found. Try again.");
    };

    setLoading(true);
    fetchWithRetry().finally(() => {
      if (!cancelled) setLoading(false);
    });

    return () => {
      cancelled = true;
    };
  }, [email]);

  return { data, userName, loading, error };
};
