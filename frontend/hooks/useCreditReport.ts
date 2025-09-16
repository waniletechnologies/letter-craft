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
    let cancelled = false;

    const fetchUntilAvailable = async (delay = 1500) => {
      setLoading(true);
      setError(null);

      while (!cancelled) {
        try {
          const res = await fetchStoredCreditReport(email);
          if (cancelled) return;

          if (res.success && res.data) {
            const transformed = transformCreditReportData(res.data);
            setData(transformed);

            const nameObj = res.data.personalInfo?.Experian?.names?.[0];
            if (nameObj) {
              setUserName(
                `${nameObj.first ?? ""} ${nameObj.last ?? ""}`.trim()
              );
            }
            setError(null);
            setLoading(false); // ✅ stop loading once we have valid data
            return;
          }
        } catch (err) {
          console.error("Fetch credit report error:", err);
          if (!cancelled) setError("Unable to fetch credit report.");
        }

        // Wait before trying again
        await new Promise((resolve) => setTimeout(resolve, delay));
      }
    };

    fetchUntilAvailable();

    return () => {
      cancelled = true;
    };
  }, [email]);

  return { data, userName, loading, error };
};
