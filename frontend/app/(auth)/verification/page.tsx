"use client";

import { useState, useRef, KeyboardEvent, ClipboardEvent } from "react";
import AuthLeftSection from "../components/AuthLeftSection";
import { useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";
export default function VerificationCodePage() {
    const router = useRouter()
  const [code, setCode] = useState<string[]>(["", "", "", "", "", ""]);
  const [error, setError] = useState(false);
  const [isShaking, setIsShaking] = useState(false);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  const handleInputChange = (index: number, value: string) => {
    if (!/^\d*$/.test(value)) return; // Only allow digits

    const newCode = [...code];
    newCode[index] = value;
    setCode(newCode);
    setError(false);

    // Auto-focus next input
    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index: number, e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Backspace") {
      if (code[index] === "" && index > 0) {
        // Focus previous input if current is empty
        inputRefs.current[index - 1]?.focus();
      } else {
        // Clear current input
        const newCode = [...code];
        newCode[index] = "";
        setCode(newCode);
      }
    }
  };

  const handlePaste = (e: ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData("text").replace(/\D/g, ""); // Remove non-digits
    if (pastedData.length <= 6) {
      const newCode = pastedData.split("").slice(0, 6);
      // Fill remaining slots with empty strings
      while (newCode.length < 6) {
        newCode.push("");
      }
      setCode(newCode);
      setError(false);

      // Focus the next empty input or the last filled one
      const nextEmptyIndex = newCode.findIndex((digit) => digit === "");
      const focusIndex = nextEmptyIndex === -1 ? 5 : nextEmptyIndex;
      inputRefs.current[focusIndex]?.focus();
    }
  };

  const triggerShakeAnimation = () => {
    setIsShaking(true);
    setTimeout(() => setIsShaking(false), 500);
  };

  const handleVerify = () => {
    const verificationCode = code.join("");

    if (verificationCode.length !== 6) {
      setError(true);
      triggerShakeAnimation();
      return;
    }

    // For demo purposes, check if code is "273273"
    if (verificationCode !== "273273") {
      setError(true);
      triggerShakeAnimation();
    } else {
      setError(false);
      router.replace('/reset-password')
    }
  };

  const handleResend = () => {
    alert("Verification code resent!");
    setCode(["", "", "", "", "", ""]);
    setError(false);
    inputRefs.current[0]?.focus();
  };

  const handleBack = () => {
    alert("Navigating back to sign in...");
  };

  return (
    <div className="flex min-h-screen bg-gray-50 p-6">
      {/* <div className="flex w-full rounded-3xl overflow-hidden shadow-lg bg-white"> */}
      {/* Left Section */}
      <AuthLeftSection />

      {/* Right Section - Verification Code */}
      <div className="flex flex-col justify-center items-center w-full lg:w-1/2 px-8 py-12">
        <div className="w-[full] max-w-sm">
          <h2 className="text-[32px] font-bold mb-2 text-gray-900">
            Enter Verification Code
          </h2>
          <p className="text-gray-500 mb-8 text-[14px] font-normal">
            Enter 6-Digit Code to Retrieve password
          </p>

          <div className="space-y-6">
            {/* Code Inputs */}
            <div
              className={`flex justify-between gap-2 ${
                isShaking ? "animate-shake" : ""
              }`}
            >
              {code.map((digit, index) => (
                <input
                  key={index}
                  type="text"
                  inputMode="numeric"
                  pattern="[0-9]*"
                  maxLength={1}
                  value={digit}
                  onChange={(e) => handleInputChange(index, e.target.value)}
                  onKeyDown={(e) => handleKeyDown(index, e)}
                  onPaste={index === 0 ? handlePaste : undefined}
                  ref={(el) => (inputRefs.current[index] = el)}
                  className={`w-[50px] h-[68px] text-center text-xl text-[#000000] font-semibold border rounded-lg focus:ring-2 focus:ring-[#1379F2] focus:border-transparent outline-none transition-colors ${
                    error ? "border-[#1379F2]" : "border-gray-300"
                  }`}
                  autoComplete="off"
                />
              ))}
            </div>

            {error && (
              <p className="text-red-500 text-sm text-center flex  gap-1">
                <p className="text-red-500">⚠</p>
                Incorrect verification code
              </p>
            )}

            {/* Buttons */}
            <div className="flex gap-[32px] mt-8">
              <Button
                type="button"
                onClick={handleBack}
                className="flex-1 w-[127px] h-[40px] bg-[#FFFFFF] py-3 px-4 border border-[#E4E4E7] text-gray-700 font-semibold rounded-lg hover:bg-gray-50 transition duration-200 focus:ring-2 focus:ring-gray-200 outline-none"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                onClick={handleVerify}
                className="flex-1 w-[183px] h-[40px] --primary hover:bg-blue-700 text-white font-semibold py-3 px-4 rounded-lg transition duration-200 focus:ring-4 focus:ring-blue-200 outline-none"
              >
                Verify
              </Button>
              {/* <button
                type="button"
                onClick={handleVerify}
                className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-4 rounded-lg transition duration-200 focus:ring-4 focus:ring-blue-200 outline-none"
              >
                Verify
              </button> */}
            </div>
          </div>

          {/* Resend Code */}
          <div className="mt-6">
            <p className="text-[#000000] text-sm">
              If you don&apos;t receive any code.{" "}
              <button
                type="button"
                onClick={handleResend}
                className="text-[#1379F2] hover:text-blue-800 font-medium underline focus:outline-none focus:ring-2 focus:ring-blue-200 rounded-md"
              >
                Resend
              </button>
            </p>
          </div>
        </div>
      </div>
      {/* </div> */}

      <style>{`
        @keyframes shake {
          0%,
          100% {
            transform: translateX(0);
          }
          10%,
          30%,
          50%,
          70%,
          90% {
            transform: translateX(-5px);
          }
          20%,
          40%,
          60%,
          80% {
            transform: translateX(5px);
          }
        }
        .animate-shake {
          animation: shake 0.5s ease-in-out;
        }
      `}</style>
    </div>
  );
}
