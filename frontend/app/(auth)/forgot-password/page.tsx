"use client";
import { useState } from "react";
import { ArrowLeft } from "lucide-react";
import AuthLeftSection from "../components/AuthLeftSection";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { requestPasswordReset } from "@/lib/auth";

export default function ForgotPasswordPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const res = await requestPasswordReset(email);
      if (res.ok) {
        // success → go to verification screen
        router.push(`/verification?email=${encodeURIComponent(email)}`);
      } else {
        setError(res.message || "Something went wrong");
      }
    } catch (err) {
      setError("Server error");
    } finally {
      setLoading(false);
    }
  };

  const handleBackToLogin = () => {
    router.replace("/login");
  };

  return (
    <div className="flex min-h-screen bg-gray-50 p-6">
      <AuthLeftSection />
      <div className="flex flex-col justify-center items-center w-full lg:w-1/2 px-8 py-12">
        <div className="w-[340px] max-w-sm">
          <h2 className="text-[34px] font-bold font-Inter mb-2 text-gray-900 text-center">
            Forget Password?
          </h2>
          <p className="text-gray-500 mb-8 text-[14px] text-center font-normal">
            No worries, we&apos;ll send you reset instructions.
          </p>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="px-[25px]">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email <span className="text-[#1379F2]"> *</span>
              </label>
              <Input
                id="email"
                type="email"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-[#71717A] placeholder-[#71717A]"
                required
              />
            </div>

            {error && (
              <p className="text-red-500 text-xs text-center">{error}</p>
            )}

            <div className="px-[25px]">
              <Button
                type="submit"
                disabled={loading}
                className="w-[300px] --primary hover:bg-blue-700 text-white font-semibold py-3 px-4 rounded-lg transition duration-200 focus:ring-4 focus:ring-blue-200 mt-6"
              >
                {loading ? "Sending..." : "Submit"}
              </Button>
            </div>
          </form>

          <button
            onClick={handleBackToLogin}
            className="flex items-center justify-center gap-2 w-full mt-6 text-gray-600 hover:text-gray-800 transition duration-200"
          >
            <ArrowLeft className="h-4 w-4 text-[#71717A]" />
            <span className="text-sm text-[#71717A]">Back to Sign in</span>
          </button>
        </div>
      </div>
    </div>
  );
}
