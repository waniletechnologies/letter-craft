export function extractPersonalInfo(reportData) {
  const personalInfoByBureau = {
    Experian: {
      names: [],
      employers: [],
      ssns: [],
      addresses: [],
      previousAddresses: [],
      births: [],
      creditScore: null,
      creditReportDate: null,
    },
    TransUnion: {
      names: [],
      employers: [],
      ssns: [],
      addresses: [],
      previousAddresses: [],
      births: [],
      creditScore: null,
      creditReportDate: null,
    },
    Equifax: {
      names: [],
      employers: [],
      ssns: [],
      addresses: [],
      previousAddresses: [],
      births: [],
      creditScore: null,
      creditReportDate: null,
    },
  };

  const components = reportData?.BundleComponents?.BundleComponent || [];

  for (let comp of components) {
    if (comp.Type === "MergeCreditReports") {
      const borrowers = comp.TrueLinkCreditReportType?.Borrower || [];
      const borrowerList = Array.isArray(borrowers) ? borrowers : [borrowers];

      for (let borrower of borrowerList) {
        // ===== Names =====
        const names = borrower?.BorrowerName || [];
        const nameList = Array.isArray(names) ? names : [names];

        for (let n of nameList) {
          const bureauAbbr = n?.Source?.Bureau?.abbreviation || "";
          let bKey = null;
          if (bureauAbbr.includes("Experian")) bKey = "Experian";
          if (bureauAbbr.includes("TransUnion")) bKey = "TransUnion";
          if (bureauAbbr.includes("Equifax")) bKey = "Equifax";
          if (!bKey) continue;

          personalInfoByBureau[bKey].names.push({
            first: n?.Name?.first || "",
            middle: n?.Name?.middle || "",
            last: n?.Name?.last || "",
            type: n?.NameType?.description || "",
          });
        }

        // ===== Employers =====
        const employers = borrower?.Employer || [];
        const employerList = Array.isArray(employers) ? employers : [employers];

        for (let e of employerList) {
          const bureauAbbr = e?.Source?.Bureau?.abbreviation || "";
          let bKey = null;
          if (bureauAbbr.includes("Experian")) bKey = "Experian";
          if (bureauAbbr.includes("TransUnion")) bKey = "TransUnion";
          if (bureauAbbr.includes("Equifax")) bKey = "Equifax";
          if (!bKey) continue;

          personalInfoByBureau[bKey].employers.push({
            name: e?.name || "",
            dateUpdated: e?.dateUpdated || "",
            city: e?.CreditAddress?.city || "",
            state: e?.CreditAddress?.stateCode || "",
            street:
              e?.CreditAddress?.unparsedStreet ||
              e?.CreditAddress?.streetName ||
              "",
            postalCode: e?.CreditAddress?.postalCode || "",
          });
        }

        // ===== Social Security Numbers =====
        const socials = borrower?.SocialPartition?.Social || [];
        const socialList = Array.isArray(socials) ? socials : [socials];

        for (let s of socialList) {
          const bureauAbbr = s?.Source?.Bureau?.abbreviation || "";
          let bKey = null;
          if (bureauAbbr.includes("Experian")) bKey = "Experian";
          if (bureauAbbr.includes("TransUnion")) bKey = "TransUnion";
          if (bureauAbbr.includes("Equifax")) bKey = "Equifax";
          if (!bKey) continue;

          personalInfoByBureau[bKey].ssns.push({
            number: s?.SocialSecurityNumber || "",
            inquiryDate: s?.Source?.InquiryDate || "",
            reference: s?.Source?.Reference || "",
          });
        }

        // ===== Birth Dates =====
        const births = borrower?.Birth || [];
        const birthList = Array.isArray(births) ? births : [births];

        for (let b of birthList) {
          const bureauAbbr = b?.Source?.Bureau?.abbreviation || "";
          let bKey = null;
          if (bureauAbbr.includes("Experian")) bKey = "Experian";
          if (bureauAbbr.includes("TransUnion")) bKey = "TransUnion";
          if (bureauAbbr.includes("Equifax")) bKey = "Equifax";
          if (!bKey) continue;

          personalInfoByBureau[bKey].births.push({
            date: b?.date || "",
            year: b?.BirthDate?.year || "",
            month: b?.BirthDate?.month || "",
            day: b?.BirthDate?.day || "",
            inquiryDate: b?.Source?.InquiryDate || "",
            reference: b?.Source?.Reference || "",
          });
        }

        // ===== Current Addresses =====
        const borrowerAddresses = borrower?.BorrowerAddress || [];
        const borrowerAddressList = Array.isArray(borrowerAddresses)
          ? borrowerAddresses
          : [borrowerAddresses];

        for (let addr of borrowerAddressList) {
          const bureauAbbr = addr?.Source?.Bureau?.abbreviation || "";
          let bKey = null;
          if (bureauAbbr.includes("Experian")) bKey = "Experian";
          if (bureauAbbr.includes("TransUnion")) bKey = "TransUnion";
          if (bureauAbbr.includes("Equifax")) bKey = "Equifax";
          if (!bKey) continue;

          personalInfoByBureau[bKey].addresses.push({
            dateReported: addr?.dateReported || "",
            dateUpdated: addr?.dateUpdated || "",
            city: addr?.CreditAddress?.city || "",
            state: addr?.CreditAddress?.stateCode || "",
            street:
              addr?.CreditAddress?.unparsedStreet ||
              `${addr?.CreditAddress?.houseNumber || ""} ${
                addr?.CreditAddress?.streetName || ""
              } ${addr?.CreditAddress?.streetType || ""}`.trim(),
            postalCode: addr?.CreditAddress?.postalCode || "",
          });
        }

        // ===== Previous Addresses =====
        const prevAddresses = borrower?.PreviousAddress || [];
        const prevAddressList = Array.isArray(prevAddresses)
          ? prevAddresses
          : [prevAddresses];

        for (let addr of prevAddressList) {
          const bureauAbbr = addr?.Source?.Bureau?.abbreviation || "";
          let bKey = null;
          if (bureauAbbr.includes("Experian")) bKey = "Experian";
          if (bureauAbbr.includes("TransUnion")) bKey = "TransUnion";
          if (bureauAbbr.includes("Equifax")) bKey = "Equifax";
          if (!bKey) continue;

          personalInfoByBureau[bKey].previousAddresses.push({
            dateReported: addr?.dateReported || "",
            dateUpdated: addr?.dateUpdated || "",
            city: addr?.CreditAddress?.city || "",
            state: addr?.CreditAddress?.stateCode || "",
            street:
              addr?.CreditAddress?.unparsedStreet ||
              `${addr?.CreditAddress?.houseNumber || ""} ${
                addr?.CreditAddress?.streetName || ""
              } ${addr?.CreditAddress?.streetType || ""}`.trim(),
            postalCode: addr?.CreditAddress?.postalCode || "",
          });
        }

        // ===== Credit Score (VantageScore) =====
        const creditScores = borrower?.CreditScore || [];
        const scoreList = Array.isArray(creditScores)
          ? creditScores
          : [creditScores];

        for (let score of scoreList) {
          const bureauAbbr = score?.Source?.Bureau?.abbreviation || "";
          let bKey = null;
          if (bureauAbbr.includes("Experian")) bKey = "Experian";
          if (bureauAbbr.includes("TransUnion")) bKey = "TransUnion";
          if (bureauAbbr.includes("Equifax")) bKey = "Equifax";
          if (!bKey) continue;

          // Only store VantageScore
          if (
            score?.scoreName?.toLowerCase().includes("vantage") ||
            score?.CreditScoreModel?.description
              ?.toLowerCase()
              .includes("vantage")
          ) {
            personalInfoByBureau[bKey].creditScore = score?.riskScore || null;
            personalInfoByBureau[bKey].creditReportDate =
              score?.Source?.InquiryDate || null;
          }
        }
      }
    }
  }

  return personalInfoByBureau;
}
