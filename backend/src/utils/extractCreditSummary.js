export function extractCreditSummary(reportData) {
  const summary = { Experian: {}, TransUnion: {}, Equifax: {} };
  const components = reportData?.BundleComponents?.BundleComponent || [];

  const counts = {
    Experian: {
      total: 0,
      open: 0,
      close: 0,
      derog: 0,
      delinquent: 0,
      balance: 0,
    },
    TransUnion: {
      total: 0,
      open: 0,
      close: 0,
      derog: 0,
      delinquent: 0,
      balance: 0,
    },
    Equifax: {
      total: 0,
      open: 0,
      close: 0,
      derog: 0,
      delinquent: 0,
      balance: 0,
    },
  };

  // ======== Calculate tradeline summary ========
  for (let comp of components) {
    if (comp.Type === "MergeCreditReports") {
      const partitions =
        comp.TrueLinkCreditReportType?.TradeLinePartition || [];
      for (let p of partitions) {
        let tradelines = p.Tradeline;
        if (!tradelines) continue;
        if (!Array.isArray(tradelines)) tradelines = [tradelines];

        for (let t of tradelines) {
          const bureau = t.bureau || "";
          const bKey = bureau.includes("Experian")
            ? "Experian"
            : bureau.includes("TransUnion")
            ? "TransUnion"
            : bureau.includes("Equifax")
            ? "Equifax"
            : null;
          if (!bKey) continue;

          counts[bKey].total++;
          if (t.AccountCondition?.abbreviation === "Open") counts[bKey].open++;
          if (t.AccountCondition?.abbreviation === "Closed")
            counts[bKey].close++;
          if (t.AccountCondition?.abbreviation === "Derog")
            counts[bKey].derog++;
          if (t.PayStatus?.abbreviation === "Coll/Chargeoff")
            counts[bKey].delinquent++;
          if (t.currentBalance)
            counts[bKey].balance += parseInt(t.currentBalance, 10) || 0;
        }
      }
    }
  }

  // ======== Add Inquiry + Public Record summaries ========
  let inquirySummary = {};
  let publicRecordSummary = {};

  for (let comp of components) {
    if (comp.Type === "MergeCreditReports") {
      inquirySummary =
        comp.TrueLinkCreditReportType?.Summary?.InquirySummary || {};
      publicRecordSummary =
        comp.TrueLinkCreditReportType?.Summary?.PublicRecordSummary || {};
    }
  }

  // ======== Build final summary per bureau ========
  for (let bureau of ["Experian", "TransUnion", "Equifax"]) {
    summary[bureau] = {
      totalAccounts: counts[bureau].total,
      openAccounts: counts[bureau].open,
      closeAccounts: counts[bureau].close,
      derogatoryAccounts: counts[bureau].derog,
      delinquentAccounts: counts[bureau].delinquent,
      totalBalance: `$${counts[bureau].balance.toLocaleString()}`,
      inquiries2Years: inquirySummary?.[bureau]?.NumberInLast2Years || "0",
      publicRecords: publicRecordSummary?.[bureau]?.NumberOfRecords || "0",
    };
  }

  return summary;
}
