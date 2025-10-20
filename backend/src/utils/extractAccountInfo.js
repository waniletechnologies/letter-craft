export function extractAccountInfo(reportData) {
  const output = { Experian: [], TransUnion: [], Equifax: [] };
  const components = reportData?.BundleComponents?.BundleComponent || [];

  // Allowed conditions
  const allowedPayStatus = ["Coll/Chargeoff", "Repo"];
  const allowedWorstPayStatus = [
    "Coll/Chargeoff",
    "30 Delinq",
    "60 Delinq",
    "90 Delinq",
    "120 Delinq",
    "150 Delinq",
    "180 Delinq",
    "Repo",
  ];

  for (let comp of components) {
    if (comp.Type === "MergeCreditReports") {
      const partitions =
        comp.TrueLinkCreditReportType?.TradeLinePartition || [];
      for (let p of partitions) {
        let tradelines = p.Tradeline;
        if (!tradelines) continue;
        if (!Array.isArray(tradelines)) tradelines = [tradelines];

        for (let t of tradelines) {
          // Apply conditions
          const isDerog = t.AccountCondition?.abbreviation === "Derog";
          const hasBadPayStatus = allowedPayStatus.includes(
            t.PayStatus?.abbreviation || ""
          );
          const hasBadWorstPayStatus = allowedWorstPayStatus.includes(
            t.GrantedTrade?.WorstPayStatus?.abbreviation || ""
          );

          if (!(isDerog || hasBadPayStatus || hasBadWorstPayStatus)) {
            continue; // skip if none match
          }

          const bureau = t.bureau || "";
          const item = {
            accountName: t.creditorName || "",
            accountNumber: t.accountNumber || "",
            highBalance: t.highBalance
              ? `$${parseInt(t.highBalance).toLocaleString()}`
              : "",
            currentBalance: t.currentBalance
              ? `$${parseInt(t.currentBalance).toLocaleString()}`
              : "",
            dateOpened: t.dateOpened || "",
            status: t.AccountCondition?.abbreviation || "",
            payStatus: t.PayStatus?.abbreviation || "",
            worstPayStatus: t.GrantedTrade?.WorstPayStatus?.abbreviation || "",
            dateClosed: t.dateClosed || "",
            remarks: Array.isArray(t.Remark)
              ? t.Remark.map(
                  (r) => r.RemarkCode?.description || r.RemarkCode?.abbreviation
                )
              : [],
          };

          if (bureau.includes("Experian")) output.Experian.push(item);
          else if (bureau.includes("TransUnion")) output.TransUnion.push(item);
          else if (bureau.includes("Equifax")) output.Equifax.push(item);
        }
      }
    }
  }
  return output;
}
