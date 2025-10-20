// app/dispute-wizard/generate-letter/page.tsx
"use client";
import React, { useState, useEffect } from "react";
import MultiSelect from "@/components/ui/multi-select";
import Typo from "typo-js";
import RichTextEditor from "@/components/ui/rich-text-editor";
import Stepper from "../components/Stepper";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { FileText, Sparkles } from "lucide-react";
import Image from "next/image";
import { Experian, Equifax, TransUnion } from "@/public/images";
import SaveLetterDialog, { SaveLetterData } from "./components/save-letter";
import StepTwo from "../components/StepTwo";
import { useSearchParams } from "next/navigation";
import { fetchLetterContent, rewriteLetter } from "@/lib/lettersApi";
import { fetchStoredCreditReport } from "@/lib/creditReportApi";
import { useDispute } from "@/context/disputeContext";
import { useGetClientFiles, UploadedFile } from "@/hooks/clients";
import Loader from '@/components/Loader';
import { toast } from "sonner";

interface PersonalInfo {
  names: Array<{
    first: string;
    middle: string;
    last: string;
    suffix?: string;
    type: string;
  }>;
  addresses: Array<{
    street: string;
    city: string;
    state: string;
    postalCode: string;
    dateReported?: string;
    dateUpdated?: string;
  }>;
  births: Array<{
    date: string;
    year: string;
    month: string;
    day: string;
  }>;
  ssns: Array<{
    number: string;
  }>;
  employers: Array<{
    name: string;
  }>;
  previousAddresses: Array<{
    street: string;
    city: string;
    state: string;
    postalCode: string;
    dateReported?: string;
    dateUpdated?: string;
  }>;
  creditScore?: string;
  creditReportDate?: string;
}

interface CreditReportData {
  personalInfo: {
    Experian: PersonalInfo;
    Equifax: PersonalInfo;
    TransUnion: PersonalInfo;
  };
  email: string;
  clientId?: string; // Add clientId to the credit report data
}

const GenerateLetterPage = () => {
  const [selectedFtcReports, setSelectedFtcReports] = useState<string[]>([]);
  const [phase] = useState(1);
  const dictionary = new Typo(
    "en_US",
    "/dictionaries/en_US/en_US.aff",
    "/dictionaries/en_US/en_US.dic",
    { asyncLoad: true }
  );
  const [isSaveDialogOpen, setIsSaveDialogOpen] = useState(false);
  const [letterContent, setLetterContent] = useState<string>("");
  const [downloadUrl, setDownloadUrl] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>("");
  const [personalInfo, setPersonalInfo] = useState<PersonalInfo | null>(null);
  const [todayDate, setTodayDate] = useState<string>("");
  const [isRewriting, setIsRewriting] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [selectedFtcReport, setSelectedFtcReport] = useState<string>("");
  const [clientId, setClientId] = useState<string>("");
  const [scheduleAt, setScheduleAt] = useState<string>("");
  const [selectedAccounts, setSelectedAccounts] = useState<any[]>([]);
  const [groupedAccounts, setGroupedAccounts] = useState<any[][]>([]);
  const [selectedGroupIndex, setSelectedGroupIndex] = useState<number>(0);
  const [originalTemplateText, setOriginalTemplateText] = useState<string>("");
  // Per-letter scheduling
  const [scheduleDateByGroup, setScheduleDateByGroup] = useState<Record<number, string>>({});
  const [scheduleTimeByGroup, setScheduleTimeByGroup] = useState<Record<number, string>>({});
  const [scheduleAtByGroup, setScheduleAtByGroup] = useState<Record<number, string>>({});
  const {
    disputeItems,
    loadSavedDisputeItems,
    setSelectedFtcReport: setContextFtcReport,
  } = useDispute();

  const searchParams = useSearchParams();
  const category = searchParams.get("category");
  const letterName = searchParams.get("letter");
  const email = searchParams.get("email");
  const accountsParam = searchParams.get("accounts");

  // Fetch client files using the hook - NOW THIS WILL WORK WHEN clientId IS SET
  const {
    data: clientFiles,
    isLoading: filesLoading,
    error: filesError,
  } = useGetClientFiles(clientId);

  // Set today's date
  useEffect(() => {
    const today = new Date();
    const formattedDate = `${String(today.getMonth() + 1).padStart(
      2,
      "0"
    )}-${String(today.getDate()).padStart(2, "0")}-${today.getFullYear()}`;
    setTodayDate(formattedDate);
  }, []);

  useEffect(() => {
    if (typeof window !== "undefined") {
      loadSavedDisputeItems();
    }
  }, [loadSavedDisputeItems]);

  // Helper to split any account list into groups of 5
  const makeGroupsOfFive = (items: any[]): any[][] => {
    const groups: any[][] = [];
    for (let i = 0; i < items.length; i += 5) {
      groups.push(items.slice(i, i + 5));
    }
    return groups;
  };

  // Unified view of groups used by both selector and renderer
  const getUiGroups = (): any[][] => {
    if (groupedAccounts.length > 0) return groupedAccounts;
    if (Array.isArray(disputeItems) && disputeItems.length > 0) {
      return makeGroupsOfFive(disputeItems);
    }
    return [];
  };

  // Parse selected accounts from query and compute groups of 5
  useEffect(() => {
    try {
      if (accountsParam) {
        const parsed = JSON.parse(accountsParam);
        if (Array.isArray(parsed)) {
          setSelectedAccounts(parsed);
          setGroupedAccounts(makeGroupsOfFive(parsed));
          setSelectedGroupIndex(0);
        }
      }
    } catch (e) {
      console.warn("Failed to parse accounts from URL", e);
    }
  }, [accountsParam]);

  // Ensure selectedGroupIndex is valid when groups change
  useEffect(() => {
    const uiGroups = getUiGroups();
    if (selectedGroupIndex >= uiGroups.length && uiGroups.length > 0) {
      setSelectedGroupIndex(0);
    }
  }, [groupedAccounts, disputeItems, selectedGroupIndex]);

  // Combine schedule date/time into ISO string whenever inputs change for selected group
  useEffect(() => {
    const datePart = scheduleDateByGroup[selectedGroupIndex] || "";
    const timePart = scheduleTimeByGroup[selectedGroupIndex] || "";
    if (!datePart || !timePart) {
      setScheduleAtByGroup((prev) => ({ ...prev, [selectedGroupIndex]: "" }));
      return;
    }
    const combined = new Date(`${datePart}T${timePart}`);
    if (!isNaN(combined.getTime())) {
      setScheduleAtByGroup((prev) => ({ ...prev, [selectedGroupIndex]: combined.toISOString() }));
    }
  }, [scheduleDateByGroup, scheduleTimeByGroup, selectedGroupIndex]);

  // Load credit report data first
  useEffect(() => {
    if (email) {
      loadCreditReportData(email);
    }
  }, [email]);

  // Check for edit letter data
  useEffect(() => {
    const editData = localStorage.getItem("editLetterData");
    if (editData) {
      const parsedData = JSON.parse(editData);
      // If editing an existing letter, load its data
      if (parsedData._id) {
        // This is a saved letter from backend
        setClientId(parsedData.clientId);
        setSelectedFtcReport(parsedData.bureau);
        setContextFtcReport(parsedData.bureau);
        // You might want to load the letter content here
      } else {
        // This is from localStorage
        setClientId(parsedData.clientId);
        setSelectedFtcReport(parsedData.letterDetails?.bureau || "");
        setContextFtcReport(parsedData.letterDetails?.bureau || "");
      }
      // Clear the edit data after using it
      localStorage.removeItem("editLetterData");
    }
  }, []);

  // Then load letter content when personalInfo is available
  useEffect(() => {
    if (category && letterName && personalInfo) {
      loadLetterContent(category, letterName);
    }
  }, [category, letterName, personalInfo]);

  // Update context when FTC report is selected
  useEffect(() => {
      if (selectedFtcReports.length > 0 && clientFiles?.ftcReport) {
      const selectedReports = clientFiles.ftcReport.filter(
        (report: UploadedFile) => selectedFtcReports.includes(report._id)
      );
      if (selectedReports.length > 0) {
        // Update your context to handle multiple reports
        setContextFtcReport(selectedReports);
        // Persist selections into localStorage for send step hydration
        try {
          const saved = localStorage.getItem('savedLetterData');
          if (saved) {
            const parsed = JSON.parse(saved);
            parsed.selectedFtcReports = selectedFtcReports;
            localStorage.setItem('savedLetterData', JSON.stringify(parsed));
          }
        } catch {}
      }
    }
  }, [selectedFtcReports, clientFiles, setContextFtcReport]);

  const loadCreditReportData = async (userEmail: string) => {
    try {
      const response = await fetchStoredCreditReport(userEmail);
      if (response.success && response.data) {
        const creditData: CreditReportData = response.data;
        const experianInfo = creditData.personalInfo.Experian;
        const equifaxInfo = creditData.personalInfo.Equifax;
        const transunionInfo = creditData.personalInfo.TransUnion;

        const primaryInfo =
          experianInfo.names.length > 0
            ? experianInfo
            : equifaxInfo.names.length > 0
            ? equifaxInfo
            : transunionInfo;

        setPersonalInfo(primaryInfo);

        // Set clientId if available in credit report data
        if (creditData.clientId) {
          setClientId(creditData.clientId);
          console.log("Client ID from credit report:", creditData.clientId);
        } else {
          // Fallback: Try to find client by name and email
          await findClientByNameAndEmail(primaryInfo, userEmail);
        }
      }
    } catch (err) {
      console.error("Error loading credit report data:", err);
    }
  };

  const findClientByNameAndEmail = async (
    personalInfo: PersonalInfo,
    email: string
  ) => {
    try {
      if (!personalInfo.names.length) return;

      const firstName = personalInfo.names[0].first;
      const lastName = personalInfo.names[0].last;

      // Properly decode the email
      let decodedEmail = email;
      console.log("Mail: ", email)
      try {
        decodedEmail = decodeURIComponent(decodedEmail);
        console.log("Decoded Mail: ", decodedEmail)
        // Handle potential double encoding
        if (decodedEmail.includes("%25")) {
          decodedEmail = decodeURIComponent(decodedEmail);
        }
      } catch (error) {
        console.log("Error decoding email:", error);
      }

      // Search for client by email first
      const response = await fetch(
        `${
          process.env.NEXT_PUBLIC_BACKEND_URL
        }/api/clients/search-email?email=${decodeURIComponent(decodedEmail)}`
      );

      console.log("Client search request:", decodeURIComponent(decodedEmail));

      console.log("Client search response:", response);

      if (response.ok) {
        const data = await response.json();
        console.log("Client search data:", data);

        if (data.success && data.data && data.data.length > 0) {
          const client = data.data[0];
          console.log("Client found by email:", client._id);
          setClientId(client._id);
          return;
        }
      }

      // If no client found, don't create one - just log and continue without client
      console.log("No client found for email:", decodedEmail);
      console.log("Continuing without client - no FTC reports will be available");
      setClientId(""); // Set empty string instead of temp-client-id
    } catch (error) {
      console.error("Error searching for client:", error);
    }
  };

  const formatSSN = (ssn: string) => {
    if (ssn.length === 9) {
      return `${ssn.substring(0, 3)}-${ssn.substring(3, 5)}-${ssn.substring(
        5
      )}`;
    }
    return ssn;
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return "N/A";
    try {
      const date = new Date(dateString);
      return `${String(date.getMonth() + 1).padStart(2, "0")}/${String(
        date.getDate()
      ).padStart(2, "0")}/${date.getFullYear()}`;
    } catch {
      return dateString;
    }
  };

  const getSenderAddress = () => {
    if (!personalInfo) {
      return "Michael Yaldo\n4823 Bantry Dr\nWest Bloomfield, Michigan 48322";
    }

    const name = personalInfo.names[0];
    const address = personalInfo.addresses[0];
    const birth = personalInfo.births[0];
    const ssn = personalInfo.ssns[0];

    const fullName = `${name?.first || ""} ${name?.middle || ""} ${
      name?.last || ""
    } ${name?.suffix || ""}`.trim();
    const addressLine = address
      ? `${address.street}, ${address.city}, ${address.state} ${address.postalCode}`
      : "";
    const dob = birth?.date ? formatDate(birth.date) : "N/A";
    const ssnFormatted = ssn?.number ? formatSSN(ssn.number) : "N/A";

    return `${fullName}\n${addressLine}\nDate of Birth: ${dob}\nSSN: ${ssnFormatted}\nToday's Date: ${todayDate}`;
  };

  const getToAddress = () => {
    if (
      category?.toUpperCase().includes("EXPERIAN") ||
      letterName?.toUpperCase().includes("EXPERIAN")
    ) {
      return "EXPERIAN\nP.O. BOX 4500\nALLEN, TX 75013";
    } else if (
      category?.toUpperCase().includes("TRANSUNION") ||
      letterName?.toUpperCase().includes("TRANSUNION")
    ) {
      return "TRANSUNION\nP.O. BOX 2000\nCHESTER, PA 19016";
    } else {
      return "EQUIFAX\nP.O. BOX 740250\nATLANTA, GA 30374";
    }
  };

  useEffect(() => {
    // Check if we're coming from edit mode
    const editLetterData = localStorage.getItem("editLetterData");
    if (editLetterData) {
      const parsedData = JSON.parse(editLetterData);

      // Pre-populate the form with the saved data
      setSelectedFtcReports(parsedData.selectedFtcReports || []);

      // You might want to set other fields based on the saved data
      console.log("Editing letter:", parsedData);

      // Clear the edit data after using it
      localStorage.removeItem("editLetterData");
    }
  }, []);

  // Also update the getFtcReportOptions function to show selected reports
  const getFtcReportOptions = () => {
    if (
      !clientFiles?.data?.ftcReport ||
      clientFiles?.data?.ftcReport.length === 0
    ) {
      return [];
    }

    return clientFiles.data.ftcReport.map((report: UploadedFile) => ({
      value: report._id,
      label:
        report.originalName ||
        report.fileName ||
        `FTC Report ${report._id.substring(0, 8)}`,
      url: report.url,
      selected: selectedFtcReports.includes(report._id), // Add selected flag
    }));
  };

  const handleFtcReportChange = (values: string[]) => {
    setSelectedFtcReports(values);
    console.log("Selected FTC Report IDs:", values);
  };

  // Add debug logging to see when clientId changes
  useEffect(() => {
    console.log("Client ID updated:", clientId);
  }, [clientId]);

  // Add debug logging for client files
  useEffect(() => {
    console.log("Client files updated:", clientFiles);
    console.log("Files loading:", filesLoading);
    console.log("Files error:", filesError);
  }, [clientFiles, filesLoading, filesError]);

  const formatLetterContent = (content: string) => {
    const formattedContent = content
      .replace(
        /(Urgent Removal of Fraudulent Information)/g,
        '<strong class="font-bold">$1</strong>'
      )
      .replace(
        /(15 U.S. Code § 1681c-2)/g,
        '<strong class="font-bold">$1</strong>'
      )
      .replace(/(identity theft)/gi, '<strong class="font-bold">$1</strong>')
      .replace(
        /(fraudulent information)/gi,
        '<strong class="font-bold">$1</strong>'
      )
      .replace(/(credit report)/gi, '<strong class="font-bold">$1</strong>')
      .replace(
        /(FTC Identity Theft Report)/g,
        '<strong class="font-bold">$1</strong>'
      )
      .replace(/(four business days)/g, '<strong class="font-bold">$1</strong>')
      .replace(/(block request)/g, '<strong class="font-bold">$1</strong>')
      .replace(
        /(material misrepresentation)/g,
        '<strong class="font-bold">$1</strong>'
      )
      .replace(
        /Subject:/g,
        '<h2 style="font-weight: 600; font-size: 14px; margin-bottom: 16px;">Subject:<h2/>'
      )
      .replace(
        /Dear Equifax,/g,
        '<div style="margin-bottom: 16px;">Dear Equifax,</div>'
      )
      .replace(/Dear Experian,/g, '<div class="font-bold">Dear Experian,</div>')
      .replace(
        /Dear Transunion,/g,
        '<div class="font-bold">Dear Transunion,</div>'
      )
      .replace(
        /Hello Experian,/g,
        '<div class="font-bold">Hello Experian,</div>'
      )
      .replace(/Hello Equifax,/g, '<div class="font-bold">Hello Equifax,</div>')
      .replace(
        /Hello Transunion,/g,
        '<div class="font-bold">Hello Transunion,</div>'
      )
      .replace(
        /Thank you for your immediate attention\./g,
        '<div style="margin-top: 24px; margin-bottom: 16px;">Thank you for your immediate attention.</div>'
      )
      .replace(
        /Sincerely,/g,
        '<div style="margin-top: 32px; margin-bottom: 8px;">Sincerely,</div>'
      )
      .replace(
        /Enclosures:/g,
        '<div style="margin-top: 24px; font-style: italic;">Enclosures:</div>'
      );

    return formattedContent;
  };

  const fixGrammarAndEnhanceContent = (content: string) => {
    const textContent = content.replace(/<[^>]*>/g, "");

    const words = textContent.split(/(\b)/);
    const correctedWords = words.map((word) => {
      if (!word || typeof word !== "string" || !/^[a-zA-Z]+$/.test(word)) {
        return word;
      }

      try {
        if (!dictionary.check(word)) {
          const suggestions = dictionary.suggest(word);
          if (suggestions && suggestions.length > 0) {
            return suggestions[0];
          }
        }
      } catch (err) {
        console.warn("Typo check failed for word:", word, err);
      }

      return word;
    });

    return correctedWords.join("");
  };

  const populateLetterTemplate = (template: string, overrideAccounts?: any[]) => {
    if (!personalInfo) {
      return template;
    }

    // First, clean the template of any address sections for ALL bureaus
    let cleanedTemplate = template
      .replace(/FROM:[\s\S]*?TO:[\s\S]*?(?=Subject:)/i, "")
      .replace(/^\s*\S+[\s\S]*?ATLANTA, GA 30374\s*/i, "")
      .replace(/^\s*\S+[\s\S]*?CHESTER, PA 19016\s*/i, "")
      .replace(/^\s*\S+[\s\S]*?ALLEN, TX 75013\s*/i, "")
      // Remove personal info patterns that appear before the actual letter content
      .replace(/^\s*{[^}]*}[\s\S]*?{Today[''`'´'′'']?s Date[^}]*}\s*/i, "")
      .replace(/^\s*\S+[\s\S]*?\d{2}\/\d{2}\/\d{4}\s*\d{3}-\d{2}-\d{4}\s*/i, "")
      .replace(/^\s*\S+[\s\S]*?{Today[''`'´'′'']?s Date[^}]*}\s*/i, "");

    // Handle the creditor/account replacement pattern
    cleanedTemplate = cleanedTemplate.replace(
      /(Creditor:\s*{Creditors Name}[\s\S]*?{Date Opened mm\/yyyy}\s*)+/gi,
      "{DisputedAccounts}"
    );

    // Handle the pattern without "Creditor:" label (like in TransUnion example)
    cleanedTemplate = cleanedTemplate.replace(
      /({Creditors Name}Account Number: {Account Number}Date Opened: {Date Opened mm\/yyyy}\s*)+/gi,
      "{DisputedAccounts}"
    );

    const name = personalInfo.names[0];
    const fullName = `${name?.first || ""} ${name?.middle || ""} ${
      name?.last || ""
    } ${name?.suffix || ""}`.trim();
    const address = personalInfo.addresses[0];
    const birth = personalInfo.births[0];
    const ssn = personalInfo.ssns[0];

    const addressLine = address
      ? `${address.street}, ${address.city}, ${address.state} ${address.postalCode}`
      : "";
    const dob = birth?.date ? formatDate(birth.date) : "N/A";
    const ssnFormatted = ssn?.number ? formatSSN(ssn.number) : "N/A";

    let accountDetails = "";
    const sourceItems =
      (overrideAccounts && overrideAccounts.length > 0)
        ? overrideAccounts
        : (getUiGroups()[selectedGroupIndex] || []);

    if (sourceItems && sourceItems.length > 0) {
      accountDetails = sourceItems
        .map((item) => {
          const dateOpened = item.dateOpened
            ? new Date(item.dateOpened).toLocaleDateString("en-US", {
                month: "2-digit",
                year: "numeric",
              })
            : "N/A";

          // Check if the template uses the format with "Creditor:" label or without
          if (template.includes("Creditor: {Creditors Name}")) {
            return `\n\nCreditor: ${item.creditor}\nAccount Number: ${item.account}\nDate Opened: ${dateOpened}\n\n`;
          } else {
            // For templates like TransUnion that don't have "Creditor:" label
            return `${item.creditor}\nAccount Number: ${item.account}\nDate Opened: ${dateOpened}\n\n`;
          }
        })
        .join("\n\n");
    }

    let populatedTemplate = cleanedTemplate
      .replace(/{First Name}/g, name?.first || "")
      .replace(/{Middle Name}/g, name?.middle || "")
      .replace(/{Last Name}/g, name?.last || "")
      .replace(/{Suffix}/g, name?.suffix || "")
      .replace(/{First Name} {Middle Name} {Last Name} {Suffix}/g, fullName)
      .replace(/{Address}/g, address?.street || "")
      .replace(/{City}/g, address?.city || "")
      .replace(/{State}/g, address?.state || "")
      .replace(/{Zip code}/g, address?.postalCode || "")
      .replace(/{City}, {State} {Zip code}/g, addressLine)
      .replace(/{Date of Birth mm\/dd\/yyyy}/g, dob)
      .replace(/{Social Security Number XXX-XX-XXXX}/g, ssnFormatted)
      .replace(/{Today's Date mm-dd-yyyy}/g, todayDate)
      .replace(/{SIGNATURE}/g, "\n")
      .replace(/{Today[''`'´'′'']?s Date mm-dd-yyyy}/gi, `: ${todayDate}`)
      .replace(/{Today[''`'´'′'']?s Date[^}]*}/gi, todayDate)
      .replace(/{Experian Report Number}/gi, "")
      .replace(/{Transunion File Number}/gi, "")
      .replace(
        /{FTC Report Number}/gi,
        selectedFtcReports.length > 0
          ? `FTC Report: ${selectedFtcReports.join(", ")}`
          : "FTC Report Number"
      );

    // Inject schedule if template has placeholder
    populatedTemplate = populatedTemplate.replace(
      /{Scheduled Date\/?Time}?/gi,
      scheduleAt ? new Date(scheduleAt).toLocaleString() : ""
    );

    // Replace the disputed accounts placeholder
    populatedTemplate = populatedTemplate.replace(
      /{DisputedAccounts}/g,
      accountDetails || "No disputed accounts listed"
    );

    // Clean up any double line breaks
    populatedTemplate = populatedTemplate.replace(/\n\n\n+/g, "\n\n");

    return populatedTemplate;
  };

  const handleRewriteWithAI = async () => {
    setIsRewriting(true);
    try {
      // Convert current editor HTML to plain text for the model
      const tempDiv = document.createElement("div");
      tempDiv.innerHTML = letterContent;
      const plainText = tempDiv.textContent || tempDiv.innerText || "";

      // Send raw HTML if the editor has tags; otherwise send text
      const hasHtml = /<[^>]+>/.test(letterContent);
      const payload = hasHtml ? letterContent : plainText;
      const resp = await rewriteLetter(payload);
      if (resp.success && resp.data?.body) {
        // strip accidental fences on client too (belt-and-suspenders)
        const ai = resp.data.body
          .replace(/^```[a-zA-Z]*\n?/i, "")
          .replace(/\n?```\s*$/i, "")
          .replace(/<\/?html[^>]*>/gi, "")
          .replace(/<\/?body[^>]*>/gi, "")
          .trim();
        const nextHtml = /<[^>]+>/.test(ai) ? ai : ai.replace(/\n/g, "<br>");
        const formatted = formatLetterContent(nextHtml);
        setLetterContent(formatted);
      }
    } catch (error) {
      console.error("Error rewriting content:", error);
    } finally {
      setIsRewriting(false);
    }
  };

  const loadLetterContent = async (cat: string, name: string) => {
    try {
      setLoading(true);
      setError("");

      const response = await fetchLetterContent(cat, name);

      if (response.success && response.data) {
        let bodyContent = response.data.html;

        if (personalInfo && bodyContent) {
          const tempDiv = document.createElement("div");
          tempDiv.innerHTML = bodyContent;
          const textContent = tempDiv.textContent || tempDiv.innerText || "";

          // Remove address sections and personal info headers from ALL bureau templates
          const cleanedText = textContent
            // Remove FROM/TO sections
            .replace(/FROM:[\s\S]*?TO:[\s\S]*?(?=Subject:)/i, "")
            // Remove Experian pattern: {Report Number} + personal info
            .replace(/^{[^}]*}[\s\S]*?{Today[''`'´'′'']?s Date[^}]*}\s*/i, "")
            // Remove TransUnion pattern: {File Number} + personal info
            .replace(/^{[^}]*}[\s\S]*?{Today[''`'´'′'']?s Date[^}]*}\s*/i, "")
            // Remove generic personal info patterns at start
            .replace(
              /^\s*\S+[\s\S]*?\d{2}\/\d{2}\/\d{4}\s*\d{3}-\d{2}-\d{4}\s*/i,
              ""
            )
            // Remove any text before "Dear" or "Hello" (the actual letter start)
            .replace(/^[\s\S]*?(?=Dear|Hello|Subject:)/i, (match) => {
              // Only remove if it looks like address/personal info, not actual content
              return match.includes("{") ||
                match.includes("}") ||
                /\d{3}-\d{2}-\d{4}/.test(match) ||
                /\d{2}\/\d{2}\/\d{4}/.test(match)
                ? ""
                : match;
            });

          setOriginalTemplateText(cleanedText);
          const populatedText = populateLetterTemplate(cleanedText);
          bodyContent = populatedText.replace(/\n/g, "<br>");
        }

        const formattedContent = formatLetterContent(bodyContent);
        setLetterContent(formattedContent);
        setDownloadUrl(response.data.downloadUrl);
      } else {
        setError(response.message || "Failed to load letter content");
      }
    } catch (err) {
      setError("Error loading letter content");
      console.error("Error loading letter:", err);
    } finally {
      setLoading(false);
    }
  };

  // Regenerate letter content when switching between groups
  useEffect(() => {
    if (!originalTemplateText) return;
    try {
      const populatedText = populateLetterTemplate(originalTemplateText);
      const html = populatedText.replace(/\n/g, "<br>");
      const formattedContent = formatLetterContent(html);
      setLetterContent(formattedContent);
    } catch (e) {
      console.warn("Failed to refresh content for selected group", e);
    }
  }, [selectedGroupIndex, groupedAccounts]);

  const handleSaveLetter = (data: SaveLetterData) => {
    console.log("Saving letter with data:", data);
  };

  const handleSaveAndContinue = () => {
    // Validate that each letter has schedule date & time
    const groups = getUiGroups();
    const missing = groups.findIndex((_, idx) => !scheduleAtByGroup[idx]);
    if (groups.length > 0 && missing !== -1) {
      // Ask user to select schedule for each letter
      console.warn("Missing schedule for letter index", missing);
      toast.error("First select the schedule for all letters");
      return;
    }
    setIsSaveDialogOpen(true);
  };

  const getBureauFromCategory = (category: string | null) => {
    if (!category) return "Equifax"; // Default to Equifax

    const upperCategory = category.toUpperCase();
    if (upperCategory.includes("EXPERIAN")) return "Experian";
    if (upperCategory.includes("EQUIFAX")) return "Equifax";
    if (upperCategory.includes("TRANSUNION")) return "TransUnion";

    // Default to Equifax if no match found
    return "Equifax";
  };


  // Build prepared letters (one per group of 5) for saving/next step
  const preparedLetters = React.useMemo(() => {
    if (!originalTemplateText) return [] as Array<{
      category: string;
      letterName: string;
      bureau: string;
      content: string;
      personalInfo: PersonalInfo | null;
      displayName: string;
      scheduleAt?: string;
    }>;
    const base = [] as Array<{
      category: string;
      letterName: string;
      bureau: string;
      content: string;
      personalInfo: PersonalInfo | null;
      displayName: string;
      scheduleAt?: string;
    }>;
    const groups = groupedAccounts.length > 0
      ? groupedAccounts
      : (Array.isArray(disputeItems) ? makeGroupsOfFive(disputeItems) : []);
    groups.forEach((group, idx) => {
      const populated = populateLetterTemplate(originalTemplateText, group);
      const html = populated.replace(/\n/g, "<br>");
      const formatted = formatLetterContent(html);
      base.push({
        category: category || "",
        letterName: letterName || "",
        bureau: getBureauFromCategory(category),
        content: formatted,
        personalInfo: personalInfo,
        displayName: `${decodeURIComponent(letterName || "Letter")} - Letter ${idx + 1}`,
        // include per-letter schedule
        scheduleAt: scheduleAtByGroup[idx] || "",
      });
    });
    return base;
  }, [originalTemplateText, groupedAccounts, disputeItems, category, letterName, personalInfo, scheduleAtByGroup]);

  // Auto-assign schedules (> 10 days from today) for all letters
  const autoAssignSchedules = () => {
    const groups = getUiGroups();
    if (groups.length === 0) return;
    const today = new Date();
    const base = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    // Start at today + 11 days to ensure strictly more than 10 days
    base.setDate(base.getDate() + 11);

    const nextDates: Record<number, string> = {};
    const nextTimes: Record<number, string> = {};
    const nextIso: Record<number, string> = {};
    for (let i = 0; i < groups.length; i++) {
      const d = new Date(base);
      d.setDate(base.getDate() + i);
      const yyyy = d.getFullYear();
      const mm = String(d.getMonth() + 1).padStart(2, '0');
      const dd = String(d.getDate()).padStart(2, '0');
      nextDates[i] = `${yyyy}-${mm}-${dd}`;
      // Stagger time a bit: 09:00 + i*15 minutes, wrap at hour
      const totalMinutes = 9 * 60 + (i * 15) % (8 * 60); // between 09:00 and 17:00
      const hh = String(Math.floor(totalMinutes / 60)).padStart(2, '0');
      const min = String(totalMinutes % 60).padStart(2, '0');
      nextTimes[i] = `${hh}:${min}`;
      const iso = new Date(`${nextDates[i]}T${nextTimes[i]}`);
      nextIso[i] = isNaN(iso.getTime()) ? '' : iso.toISOString();
    }
    setScheduleDateByGroup((prev) => ({ ...prev, ...nextDates }));
    setScheduleTimeByGroup((prev) => ({ ...prev, ...nextTimes }));
    setScheduleAtByGroup((prev) => ({ ...prev, ...nextIso }));
    toast.success('Auto-assigned schedule for all letters');
  };

  const handleDownload = () => {
    // If user selected FTC reports, always generate a local DOCX with enclosures included
    const mustIncludeFtc = Array.isArray(selectedFtcReports) && selectedFtcReports.length > 0;
    if (downloadUrl && !mustIncludeFtc) {
      window.open(downloadUrl, "_blank");
      return;
    }

    // Generate a simple DOCX-like file from current content with FTC attachments section
    const content = generateDocxContent();
    const blob = new Blob([content], {
      type: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `dispute-letter-${category || "letter"}-${
      new Date().toISOString().split("T")[0]
    }.docx`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const generateDocxContent = () => {
    const senderAddress = getSenderAddress();
    const toAddress = getToAddress();

    const tempDiv = document.createElement("div");
    tempDiv.innerHTML = letterContent;

    // Extract just the body content without any address headers
    let plainTextContent = tempDiv.textContent || tempDiv.innerText || "";

    // Remove any remaining address patterns from the content for ALL bureaus
    plainTextContent = plainTextContent
      .replace(/FROM:[\s\S]*?TO:[\s\S]*?(?=Subject:)/i, "")
      .replace(/^\s*{[^}]*}[\s\S]*?{Today[''`'´'′'']?s Date[^}]*}\s*/i, "")
      .replace(
        /^\s*\S+[\s\S]*?\d{2}\/\d{2}\/\d{4}\s*\d{3}-\d{2}-\d{4}\s*/i,
        ""
      );

    // For DOCX export, we want the addresses at the top, then the clean content
    let fullContent = `FROM:\n${senderAddress}\n\nTO:\n${toAddress}\n\n${plainTextContent}`;

    // Append FTC attachments as Enclosures if any are selected
    try {
      if (Array.isArray(selectedFtcReports) && selectedFtcReports.length > 0) {
        const allOptions = getFtcReportOptions();
        const selected = allOptions.filter((o: any) => selectedFtcReports.includes(o.value));
        if (selected.length > 0) {
          const enclosureLines = selected
            .map((r: any) => `- ${r.label || "FTC Report"}${r.url ? ` (${r.url})` : ""}`)
            .join("\n");
          fullContent += `\n\nEnclosures:\nFTC Reports:\n${enclosureLines}`;
        }
      }
    } catch {}

    return fullContent;
  };

  // In GenerateLetterPage.tsx - add this helper function
  
  return (
    <div className="sm:p-6">
      {/* Title row with stepper on the right */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <FileText className="h-5 w-5 text-[#111827]" />
          <h1 className="font-semibold text-[20px] leading-none text-[#111827]">
            Letter Editor{" "}
            {personalInfo
              ? `(${personalInfo.names[0]?.first} ${personalInfo.names[0]?.last})`
              : "(Michael Yaldo)"}
          </h1>
          {(groupedAccounts.length > 0 ||
            (Array.isArray(disputeItems) && disputeItems.length > 0)) && (
            <div className="px-2 py-0 text-[11px]">
              Letter {selectedGroupIndex + 1}
            </div>
          )}
        </div>
        <Stepper current={phase} />
      </div>
      <div className="border w-full rounded-lg mt-5 border-gray-200">
        {/* Logos and selects */}
        <div className="border-b border-[#E5E7EB] rounded-t-lg bg-[#F6F6F6] p-3 mb-4">
          <div className="grid grid-cols-2 md:grid-cols-6 gap-3 items-center">
            <div className="col-span-2 flex items-center sm:gap-6 gap-2 sm:px-2 px-0">
              <Image
                src={Experian}
                alt="Experian"
                width={92}
                height={24}
                className="w-[92px] h-[24px]"
              />
              <Image
                src={Equifax}
                alt="Equifax"
                width={92}
                height={24}
                className="w-[92px] h-[24px]"
              />
              <Image
                src={TransUnion}
                alt="TransUnion"
                width={92}
                height={24}
                className="w-[92px] h-[24px]"
              />
            </div>
            <div className="col-span-1">
              <div className="text-[11px] text-[#6B7280] mb-1">Client Docs</div>
            </div>
            <div className="col-span-2">
              <MultiSelect
                options={getFtcReportOptions()}
                value={selectedFtcReports}
                onValueChange={handleFtcReportChange}
                placeholder={
                  !clientId
                    ? "No FTC Reports Available"
                    : filesLoading
                    ? "Loading FTC Reports..."
                    : getFtcReportOptions().length === 0
                    ? "No FTC Reports Available"
                    : "Select FTC Reports"
                }
                disabled={
                  !clientId ||
                  filesLoading ||
                  getFtcReportOptions().length === 0
                }
              />
            </div>
            <div className="sm:col-span-1 col-span-2">
              <Select
                value={String(selectedGroupIndex)}
                onValueChange={(v) => setSelectedGroupIndex(Number(v))}
                disabled={
                  groupedAccounts.length === 0 &&
                  (!Array.isArray(disputeItems) || disputeItems.length === 0)
                }
              >
                <SelectTrigger className="shadow-none w-full h-9 bg-white">
                  <SelectValue placeholder="Letter 1" />
                </SelectTrigger>
                <SelectContent>
                  {(groupedAccounts.length > 0
                    ? groupedAccounts
                    : Array.isArray(disputeItems)
                    ? makeGroupsOfFive(disputeItems)
                    : []
                  ).map((_, idx) => (
                    <SelectItem key={idx} value={String(idx)}>
                      {`Letter ${idx + 1}`}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>
        {/* Step Two Controls inline */}
        <div className="px-4 pb-2">
          <StepTwo email={email} selectedAccounts={selectedAccounts} />
        </div>
        {/* Selected Letter Info */}
        {category && letterName && (
          <div className="px-4 py-2 bg-blue-50 border-b">
            <div className="text-sm font-medium">
              Selected: {decodeURIComponent(category)} →{" "}
              {decodeURIComponent(letterName)}
            </div>
            {selectedFtcReports.length > 0 && (
              <div className="text-xs text-green-600 mt-1">
                Selected {selectedFtcReports.length} FTC Report(s):{" "}
                {selectedFtcReports
                  .map((reportId) => {
                    const report = getFtcReportOptions().find(
                      (r: {
                        value: string;
                        label: string;
                        url: string;
                        selected: boolean;
                      }) => r.value === reportId
                    );
                    return report?.label;
                  })
                  .join(", ")}
              </div>
            )}
          </div>
        )}
        {/* Schedule Date/Time - improved UI */}
        <div className="px-4 py-3">
          <div className="grid grid-cols-1 sm:grid-cols-7 gap-4 max-w-5xl items-end">
            <div className="sm:col-span-2 col-span-3">
              <Label className="text-[11px] text-[#6B7280] mb-1 block">
                Schedule Date
              </Label>
              <Input
                type="date"
                value={scheduleDateByGroup[selectedGroupIndex] || ""}
                onChange={(e) =>
                  setScheduleDateByGroup((prev) => ({
                    ...prev,
                    [selectedGroupIndex]: e.target.value,
                  }))
                }
                className="shadow-none h-9"
              />
            </div>
            <div className="sm:col-span-2 col-span-3">
              <Label className="text-[11px] text-[#6B7280] mb-1 block">
                Schedule Time
              </Label>
              <Input
                type="time"
                value={scheduleTimeByGroup[selectedGroupIndex] || ""}
                onChange={(e) =>
                  setScheduleTimeByGroup((prev) => ({
                    ...prev,
                    [selectedGroupIndex]: e.target.value,
                  }))
                }
                className="shadow-none h-9"
              />
            </div>
            <div className="sm:col-span-2 col-span-6">
              <div className="text-xs text-[#6B7280]">Preview</div>
              <div className="mt-1 inline-flex items-center gap-2 px-3 py-1 rounded-full border text-xs">
                {scheduleAtByGroup[selectedGroupIndex]
                  ? new Date(
                      scheduleAtByGroup[selectedGroupIndex]
                    ).toLocaleString()
                  : "Not scheduled"}
              </div>
            </div>
            <div className="flex flex-col sm:flex-row px-4 sm:px-0 gap-2">
              <Button
                type="button"
                className="bg-primary hover:bg-primary/90"
                onClick={autoAssignSchedules}
              >
                Auto Schedule
              </Button>
            </div>
          </div>
        </div>
        {/* Letter Envelope Information */}
        <div className="rounded-xl bg-white py-6 sm:px-12 px-4 mb-4">
          <div className="font-medium text-xs leading-[150%] -tracking-[0.03em] capitalize text-[#292524] mb-2">
            Letter Envelope Information (Only For CloudMail)
          </div>
          <div className="border border-[#00000014] rounded-lg">
            <div className="flex flex-col sm:flex-row justify-between sm:px-8 px-4 py-4">
              <div className="rounded-md p-3">
                <div className="font-medium text-xs leading-[150%] -tracking-[0.03em] capitalize text-[#292524] mb-2">
                  Send From Address:
                </div>
                <div className="font-semibold text-xs leading-[150%] -tracking-[0.03em] capitalize text-[#292524] whitespace-pre-line">
                  {getSenderAddress()}
                </div>
              </div>
              <div className="rounded-md p-3">
                <div className="font-medium text-xs leading-[150%] -tracking-[0.03em] capitalize text-[#292524] mb-2">
                  Send To Address:
                </div>
                <div className="font-semibold text-xs leading-[150%] -tracking-[0.03em] capitalize text-[#292524] whitespace-pre-line">
                  {getToAddress()}
                </div>
              </div>
            </div>
          </div>
        </div>
        {/* Editor */}
        <div className="relative">
          {loading ? (
            <div className="min-h-[360px] flex items-center justify-center">
              <Loader />
            </div>
          ) : error ? (
            <div className="min-h-[360px] flex items-center justify-center">
              <div className="text-red-500">{error}</div>
            </div>
          ) : (
            <RichTextEditor
              value={letterContent}
              onChange={setLetterContent}
              className="sm:px-12 px-4"
              onDownload={handleDownload}
              senderAddress={getSenderAddress()}
              toAddress={getToAddress()}
            />
          )}

          <Button
            size="sm"
            variant="outline"
            onClick={handleRewriteWithAI}
            disabled={isRewriting || !letterContent}
            className="mr-14 absolute border-primary right-4 bottom-4 flex items-center gap-2"
          >
            {isRewriting ? "Rewriting..." : "Rewrite with AI"}
            <Sparkles className="h-4 w-4 text-primary" />
          </Button>
        </div>
        {/* Footer actions */}
        <div className="flex flex-col sm:flex-row sm:justify-end my-4 sm:mr-12">
          <div className="flex flex-col sm:flex-row px-4 sm:px-0 gap-2">
            <Button
              className="bg-primary hover:bg-primary/90"
              onClick={handleSaveAndContinue}
              disabled={!letterContent || isSaving}
            >
              {isSaving ? "Saving..." : "Save & Continue"}
            </Button>
          </div>
        </div>
      </div>
      {/* Save Letter Dialog */}
      <SaveLetterDialog
        isOpen={isSaveDialogOpen}
        onClose={() => setIsSaveDialogOpen(false)}
        onSave={handleSaveLetter}
        selectedFtcReports={selectedFtcReports} // Change from selectedFtcReport to selectedFtcReports
        letterData={{
          category: category || "",
          letterName: letterName || "",
          bureau: getBureauFromCategory(category),
          content: letterContent,
          personalInfo: personalInfo,
        }}
        clientId={clientId}
        email={email}
        scheduleAt={scheduleAt}
        accounts={groupedAccounts[selectedGroupIndex] || selectedAccounts}
        preparedLetters={preparedLetters}
      />
    </div>
  );
};

export default GenerateLetterPage;
