"use client";
import { useState } from "react";
import { Mail, ArrowLeft } from "lucide-react";
import AuthLeftSection from "../components/AuthLeftSection";
import { useRouter } from "next/navigation";

export default function ForgotPasswordPage() {
    
  const router = useRouter();
  const [email, setEmail] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    // Handle forgot password logic here
    console.log("Reset password for:", email);
  };

  const handleBackToLogin = () => {
    // Handle navigation back to login
    router.replace("/login");
  };

  return (
    <div className="flex min-h-screen bg-gray-50 p-6">
      <div className="flex w-full rounded-3xl overflow-hidden shadow-lg">
        {/* Left Section - Reusable Component */}
        <AuthLeftSection />

        {/* Right Section */}
        <div className="flex flex-col justify-center items-center w-full lg:w-1/2 px-8 py-12">
          <div className="w-full max-w-sm">
            <h2 className="text-[34px] font-bold font-Inter mb-2 text-gray-900 text-center">
              Forget Password?
            </h2>
            <p className="text-gray-500 mb-8 text-[14px] text-center font-normal">
              No worries, we'll send you reset instructions.
            </p>

            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Email */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email *
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Mail className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    type="email"
                    placeholder="Enter your email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none text-gray-700 placeholder-gray-400"
                  />
                </div>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-4 rounded-lg transition duration-200 focus:ring-4 focus:ring-blue-200 outline-none mt-6"
              >
                Submit
              </button>
            </form>

            {/* Back to Sign In */}
            <button
              onClick={handleBackToLogin}
              className="flex items-center justify-center gap-2 w-full mt-6 text-gray-600 hover:text-gray-800 transition duration-200"
            >
              <ArrowLeft className="h-4 w-4" />
              <span className="text-sm">Back to Sign in</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
