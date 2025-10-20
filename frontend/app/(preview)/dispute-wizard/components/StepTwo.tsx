// components/StepTwo.tsx (updated)
"use client";

import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { usePathname, useRouter } from "next/navigation";
import { fetchLetters, LetterCategory } from "@/lib/lettersApi";
import Loader from "@/components/Loader";
import {toast} from "sonner";

interface StepTwoProps {
  email?: string | null;
  selectedAccounts?: Array<{
    id: string;
    creditor: string;
    account: string;
    dateOpened: string;
    balance: string;
    type: string;
    disputed: boolean;
    hasExperian: boolean;
    hasEquifax: boolean;
    hasTransUnion: boolean;
  }>;
}

const StepTwo: React.FC<StepTwoProps> = ({ email, selectedAccounts = [] }) => {
  const router = useRouter();
  const pathname = usePathname();
  const [categories, setCategories] = useState<LetterCategory[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>("");
  const [selectedLetter, setSelectedLetter] = useState<string>("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadLetters();
  }, []);

  const loadLetters = async () => {
    try {
      setLoading(true);
      const response = await fetchLetters();

      if (response.success && response.data) {
        setCategories(response.data);
        // Auto-select first category and first letter if available
        if (response.data.length > 0) {
          setSelectedCategory(response.data[0].category);
          if (response.data[0].letters.length > 0) {
            setSelectedLetter(response.data[0].letters[0].name);
          }
        }
      }
    } catch (error) {
      console.error("Error loading letters:", error);
    } finally {
      setLoading(false);
    }
  };

  const [generating, setGenerating] = useState(false);

  const handleGenerateLetter = () => {
    if (selectedCategory && selectedLetter) {
      setGenerating(true); // start loading

      // Create URL parameters with all necessary data
      const params = new URLSearchParams({
        category: selectedCategory,
        letter: selectedLetter,
      });

      if (email) {
        params.append("email", email);
      }

      if (selectedAccounts.length > 0) {
        params.append("accounts", JSON.stringify(selectedAccounts));
      }

      const targetUrl = `/dispute-wizard/generate-letter?${params.toString()}`;

      // If we're already on the generate page, replace URL and reset loading
      if (pathname?.startsWith("/dispute-wizard/generate-letter")) {
        toast.message("Generating letter...");
        router.replace(targetUrl);
        // Ensure the UI doesn't get stuck in loading state when staying on the same page
        setTimeout(() => setGenerating(false), 400);
        return;
      }

      // Use setTimeout so the button shows spinner before route change
      setTimeout(() => {
        toast.message("Generating letter...");
        router.push(targetUrl);
      }, 300);
    }
  };


  const selectedCategoryData = categories.find(
    (cat) => cat.category === selectedCategory
  );
  const letters = selectedCategoryData?.letters || [];

  return (
    <div className="rounded-lg border border-[#E5E7EB] bg-white">
      <div className="flex flex-col sm:flex-row sm:items-center gap-4 justify-between px-4 py-3 border-b border-[#E5E7EB] bg-[#F9FAFB] rounded-t-lg">
        <div className="text-sm">
          <span className="font-semibold">Step 2:</span> Choose A Letter
        </div>
        <div className="flex flex-col sm:flex-row sm:items-center gap-3">
          <Button
            className="bg-primary hover:bg-primary/90 flex items-center gap-2"
            onClick={handleGenerateLetter}
            disabled={
              !selectedCategory || !selectedLetter || loading || generating
            }
          >
            {generating ? "Generating..." : "Generate Library Letter"}
          </Button>
        </div>
      </div>

      <div className="p-4 space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 max-w-5xl gap-4">
          <div>
            <div className="text-xs text-[#6B7280] mb-1">Letter Category</div>
            <Select
              value={selectedCategory}
              onValueChange={setSelectedCategory}
              disabled={loading}
            >
              <SelectTrigger className="shadow-none w-full">
                <SelectValue
                  placeholder={loading ? "Loading..." : "Select Category"}
                />
              </SelectTrigger>
              <SelectContent>
                {categories.map((category) => (
                  <SelectItem key={category.category} value={category.category}>
                    {category.category.replace(/%20/g, " ")}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <div className="text-xs text-[#6B7280] mb-1">Letter Name</div>
            <Select
              value={selectedLetter}
              onValueChange={setSelectedLetter}
              disabled={loading || !selectedCategory}
            >
              <SelectTrigger className="shadow-none w-full">
                <SelectValue
                  placeholder={
                    !selectedCategory
                      ? "Select category first"
                      : loading
                      ? "Loading..."
                      : "Select Letter"
                  }
                />
              </SelectTrigger>
              <SelectContent>
                {letters.map((letter) => (
                  <SelectItem key={letter.name} value={letter.name}>
                    {letter.name.replace(/%20/g, " ")}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Display selected accounts summary */}
        {selectedAccounts.length > 0 && (
          <div className="mt-4 p-3 bg-blue-50 rounded-lg">
            <div className="text-sm font-medium text-blue-800 mb-2">
              Selected Accounts ({selectedAccounts.length})
            </div>
            <div className="text-xs text-blue-700 space-y-1">
              {selectedAccounts.slice(0, 3).map((account, index) => (
                <div key={account.id}>
                  {index + 1}. {account.creditor} - {account.account} (Opened:{" "}
                  {account.dateOpened})
                </div>
              ))}
              {selectedAccounts.length > 3 && (
                <div>... and {selectedAccounts.length - 3} more accounts</div>
              )}
            </div>
          </div>
        )}

        {loading && <Loader />}

        {!loading && categories.length === 0 && (
          <div className="text-sm text-yellow-600">
            No letters found in the library.
          </div>
        )}

        {selectedCategory && selectedLetter && (
          <div className="text-sm text-green-600">
            Selected: {selectedCategory.replace(/%20/g, " ")} →{" "}
            {selectedLetter.replace(/%20/g, " ")}
          </div>
        )}
      </div>
    </div>
  );
};

export default StepTwo;
