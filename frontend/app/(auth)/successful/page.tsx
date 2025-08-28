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
    <div className="flex min-h-screen bg-gray-50 p-6">
      {/* <div className="flex w-full rounded-3xl overflow-hidden shadow-lg bg-white"> */}
      {/* Left Section */}
      <AuthLeftSection />

      {/* Right Section - Success Message */}
      <div className="flex flex-col justify-center items-center w-full lg:w-1/2 px-8 py-12">
        <div className="w-full max-w-sm">
          <Card className="border-0 shadow-none">
            <CardContent className="p-0">
              {/* Success Icon */}
              <div className="flex justify-center mb-6">
                <FaCheckCircle className="h-12 w-12 text-[#2196F3]" />
              </div>

              {/* Success Message */}
              <p className="text-[18px] font-bold text-center text-[#AAABAF] mb-3">
                Your Password has been reset
              </p>
              <p className="text-xl font-semibold text-[#2A2020] text-center mb-8">
                Successfully
              </p>

              {/* Continue Button */}
              <div className="mt-8 item-center justify-center text-center">
                <Button
                  onClick={handleContinue}
                  className="w-[162px] h-[40px] text-base font-semibold bg-[#2196F3] hover:bg-blue-700"
                >
                  Continue
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
    // </div>
  );
}
