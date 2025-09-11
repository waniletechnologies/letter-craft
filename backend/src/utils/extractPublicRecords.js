export function extractPublicRecords(reportData) {
  const summary = { Experian: {}, TransUnion: {}, Equifax: {} };
  const components = reportData?.BundleComponents?.BundleComponent || [];

  let publicRecordSummary = {};

  for (let comp of components) {
    if (comp.Type === "MergeCreditReports") {
      publicRecordSummary =
        comp.TrueLinkCreditReportType?.Summary?.PublicRecordSummary || {};
    }
  }

  for (let bureau of ["Experian", "TransUnion", "Equifax"]) {
    summary[bureau] = {
      publicRecords: publicRecordSummary?.[bureau]?.NumberOfRecords || "0",
    };
  }

  return summary;
}
