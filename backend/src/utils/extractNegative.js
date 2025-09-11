export function extractNegativeAccounts(reportData) {
  const output = { Experian: [], TransUnion: [], Equifax: [] };
  const components = reportData?.BundleComponents?.BundleComponent || [];

  for (let comp of components) {
    if (comp.Type !== "MergeCreditReports") continue;
    const partitions = comp.TrueLinkCreditReportType?.TradeLinePartition || [];

    for (let p of partitions) {
      let tradelines = p.Tradeline;
      if (!tradelines) continue;
      if (!Array.isArray(tradelines)) tradelines = [tradelines];

      for (let t of tradelines) {
        const bureau = t.bureau || "";
        const item = {
          accountName: t.creditorName || "",
          accountNumber: t.accountNumber || "",
          highBalance: t.highBalance
            ? `$${parseInt(t.highBalance).toLocaleString()}`
            : "$0",
          currentBalance: t.currentBalance
            ? `$${parseInt(t.currentBalance).toLocaleString()}`
            : "$0",
          lastVerified: t.dateVerified || t.dateReported || "",
          status:
            t.AccountCondition?.description || t.OpenClosed?.description || "",
        };

        if (bureau.includes("Experian")) output.Experian.push(item);
        else if (bureau.includes("TransUnion")) output.TransUnion.push(item);
        else if (bureau.includes("Equifax")) output.Equifax.push(item);
      }
    }
  }
  return output;
}
