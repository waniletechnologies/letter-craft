"use client";

import { useState, useRef, KeyboardEvent, ClipboardEvent } from "react";
import AuthLeftSection from "../components/AuthLeftSection";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { verifyResetCode, requestPasswordReset } from "@/lib/auth";

export default function VerificationCodePage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const email = searchParams.get("email") || "";

  const [code, setCode] = useState<string[]>(["", "", "", ""]);
  const [error, setError] = useState(false);
  const [isShaking, setIsShaking] = useState(false);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  const handleInputChange = (index: number, value: string) => {
    if (!/^\d*$/.test(value)) return;
    const newCode = [...code];
    newCode[index] = value;
    setCode(newCode);
    setError(false);
    if (value && index < 3) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index: number, e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Backspace") {
      if (code[index] === "" && index > 0) {
        inputRefs.current[index - 1]?.focus();
      } else {
        const newCode = [...code];
        newCode[index] = "";
        setCode(newCode);
      }
    }
  };

  const handlePaste = (e: ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData("text").replace(/\D/g, "");
    if (pasted.length <= 4) {
      const newCode = pasted.split("").slice(0, 4);
      while (newCode.length < 4) newCode.push("");
      setCode(newCode);
      setError(false);
      inputRefs.current[Math.min(pasted.length, 3)]?.focus();
    }
  };

  const triggerShake = () => {
    setIsShaking(true);
    setTimeout(() => setIsShaking(false), 500);
  };

  const handleVerify = async () => {
    const verificationCode = code.join("");
    if (verificationCode.length !== 4 || !email) {
      setError(true);
      triggerShake();
      return;
    }
    try {
      const res = await verifyResetCode(email, verificationCode);
      if (res.ok) {
        router.replace(
          `/reset-password?email=${encodeURIComponent(
            email
          )}&code=${verificationCode}`
        );
      } else {
        setError(true);
        triggerShake();
      }
    } catch (err) {
      console.error(err);
      setError(true);
      triggerShake();
    }
  };

  const handleResend = async () => {
    if (!email) return;
    await requestPasswordReset(email);
    setCode(["", "", "", ""]);
    inputRefs.current[0]?.focus();
  };

  const handleBack = () => {
    router.replace("./forgot-password");
  };

  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* Left Section (hidden on mobile/tablet) */}
      <div className="hidden lg:flex w-1/2">
        <AuthLeftSection />
      </div>

      {/* Right Section */}
      <div className="flex flex-col justify-center items-center w-full lg:w-1/2 px-6 sm:px-8 py-10">
        <div className="w-full max-w-md sm:max-w-sm md:max-w-md">
          <h2 className="text-[26px] sm:text-[30px] md:text-[32px] font-bold mb-2 text-gray-900 text-center">
            Enter Verification Code
          </h2>
          <p className="text-gray-500 mb-8 text-[13px] sm:text-[14px] text-center">
            Enter 4-Digit Code to Retrieve Password
          </p>

          <div className="space-y-6">
            {/* Code Inputs */}
            <div
              className={`flex justify-between gap-2 sm:gap-4 ${
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
                  ref={(el) => {
                    inputRefs.current[index] = el;
                  }}
                  className={`w-[48px] h-[60px] sm:w-[50px] sm:h-[68px] text-center text-lg sm:text-xl text-black font-semibold border rounded-lg focus:ring-2 focus:ring-[#1379F2] outline-none transition-colors ${
                    error ? "border-[#1379F2]" : "border-gray-300"
                  }`}
                  autoComplete="off"
                />
              ))}
            </div>

            {error && (
              <p className="text-red-500 text-xs sm:text-sm text-center flex justify-center gap-1">
                ⚠ Incorrect verification code
              </p>
            )}

            {/* Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 sm:gap-[32px] mt-8">
              <Button
                type="button"
                onClick={handleBack}
                className="flex-1 h-[40px] bg-white border border-gray-300 text-gray-700 font-semibold rounded-lg hover:bg-gray-50 transition duration-200 focus:ring-2 focus:ring-gray-200"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                onClick={handleVerify}
                className="flex-1 h-[40px] --primary text-white font-semibold rounded-lg transition duration-200 focus:ring-4 focus:ring-blue-200"
              >
                Verify
              </Button>
            </div>
          </div>

          {/* Resend Code */}
          <div className="mt-6 text-center">
            <p className="text-black text-sm">
              Didn&apos;t receive a code?{" "}
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

      <style>{`
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          10%, 30%, 50%, 70%, 90% { transform: translateX(-5px); }
          20%, 40%, 60%, 80% { transform: translateX(5px); }
        }
        .animate-shake {
          animation: shake 0.5s ease-in-out;
        }
      `}</style>
    </div>
  );
}
