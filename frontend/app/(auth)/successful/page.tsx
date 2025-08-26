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
      <div className="flex w-full rounded-3xl overflow-hidden shadow-lg bg-white">
        {/* Left Section */}
        <AuthLeftSection />

        {/* Right Section - Success Message */}
        <div className="flex flex-col justify-center items-center w-full lg:w-1/2 px-8 py-12">
          <div className="w-full max-w-sm">
            <Card className="border-0 shadow-none">
              <CardContent className="p-0">
                {/* Success Icon */}
                <div className="flex justify-center mb-6">
                  <div className="w-20 h-20 rounded-full bg-green-100 flex items-center justify-center">
                    <FaCheckCircle className="h-12 w-12 text-green-600" />
                  </div>
                </div>

                {/* Success Message */}
                <h2 className="text-3xl font-bold text-center text-gray-900 mb-3">
                  Your Password has been reset
                </h2>
                <p className="text-xl font-semibold text-green-600 text-center mb-8">
                  Successfully
                </p>

                {/* Continue Button */}
                <div className="mt-8">
                  <Button
                    onClick={handleContinue}
                    className="w-full h-12 text-base font-semibold bg-blue-600 hover:bg-blue-700"
                  >
                    Continue
                  </Button>
                </div>

                {/* Back to Sign In */}
                <div className="text-center mt-8">
                  <button
                    onClick={() => router.push("/login")}
                    className="text-blue-600 hover:text-blue-800 text-sm font-medium transition-colors"
                  >
                    Back to Sign in
                  </button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
