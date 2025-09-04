"use client";

import { useRouter } from "next/navigation";
import { FaCheckCircle } from "react-icons/fa";
import AuthLeftSection from "../components/AuthLeftSection";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

export default function PasswordResetSuccessPage() {
  const router = useRouter();

  const handleContinue = () => {
    router.push("/login");
  };

  return (
    <div className="flex min-h-screen bg-gray-50 p-3 sm:p-6">
      {/* Left Section - Hidden on mobile */}
      <div className="hidden lg:flex lg:w-1/2">
        <AuthLeftSection />
      </div>

      {/* Right Section - Success Message */}
      <div className="flex flex-col justify-center items-center w-full lg:w-1/2 px-4 sm:px-6 md:px-8 py-8 sm:py-12">
        <div className="w-full max-w-xs sm:max-w-sm">
          <Card className="border-0 shadow-none">
            <CardContent className="p-0">
              {/* Success Icon */}
              <div className="flex justify-center mb-4 sm:mb-6">
                <FaCheckCircle className="h-10 w-10 sm:h-12 sm:w-12 text-[#2196F3]" />
              </div>

              {/* Success Message */}
              <p className="text-base sm:text-[18px] font-bold text-center text-[#AAABAF] mb-2 sm:mb-3 px-2">
                Your Password has been reset
              </p>
              <p className="text-lg sm:text-xl font-semibold text-[#2A2020] text-center mb-6 sm:mb-8">
                Successfully
              </p>

              {/* Continue Button */}
              <div className="mt-6 sm:mt-8 flex items-center justify-center text-center">
                <Button
                  onClick={handleContinue}
                  className="w-full max-w-[162px] h-[40px] sm:h-[44px] text-sm sm:text-base font-semibold bg-[#2196F3] hover:bg-[#1976D2] transition-colors"
                >
                  Continue
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
