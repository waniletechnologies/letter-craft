export function extractInquiries(reportData) {
  const output = { Experian: [], TransUnion: [], Equifax: [] };
  const components = reportData?.BundleComponents?.BundleComponent || [];

  for (let comp of components) {
    if (comp.Type === "MergeCreditReports") {
      const partitions = comp.TrueLinkCreditReportType?.InquiryPartition || [];
      for (let p of partitions) {
        if (!p || typeof p !== "object") continue;
        const inquiry = p.Inquiry || {};
        const bureau = inquiry.bureau || "";
        const rawDate = inquiry.inquiryDate || "";
        let displayDate = rawDate;
        try {
          displayDate = new Date(rawDate).toLocaleDateString("en-US");
        } catch (e) {}

        const item = {
          subscriberName: inquiry.subscriberName || "",
          inquiryDate: displayDate,
        };

        if (bureau.includes("Experian")) output.Experian.push(item);
        else if (bureau.includes("TransUnion")) output.TransUnion.push(item);
        else if (bureau.includes("Equifax")) output.Equifax.push(item);
      }
    }
  }
  return output;
}
