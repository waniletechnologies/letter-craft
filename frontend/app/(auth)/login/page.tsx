"use client";
import { useState } from "react";
import { Mail, Lock, Eye } from "lucide-react";
import AuthLeftSection from "../components/AuthLeftSection";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const handleForgotPassword = () => {
    router.replace("/forgot-password")
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
              Login
            </h2>
            <p className="text-gray-500 mb-2 text-[14px] text-center font-normal">
              Welcome back! Please enter your details below.
            </p>

            <div className="flex items-center my-4 md:my-8">
              <div className="flex-grow border-t border-gray-300"></div>
              <span className="px-2 md:px-4 text-sm md:text-base text-gray-600">
                Login with email
              </span>
              <div className="flex-grow border-t border-gray-300"></div>
            </div>

            <div className="space-y-5">
              {/* Email */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Mail className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    type="email"
                    placeholder="johnmiles@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none text-gray-400 placeholder-gray-400"
                  />
                </div>
              </div>

              {/* Password */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Password
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Lock className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    type={showPassword ? "text" : "password"}
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="block w-full pl-10 pr-10 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none text-gray-400 placeholder-gray-400"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  >
                    <Eye className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                  </button>
                </div>
              </div>

              {/* Remember me + Forgot password */}
              <div className="flex items-center justify-between pt-2">
                <label className="flex items-center gap-2 text-sm text-gray-600">
                  <input
                    type="checkbox"
                    className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500 accent-blue-600"
                  />
                  Remember me
                </label>
                <button
                  type="button"
                  onClick={handleForgotPassword}
                  className="text-sm text-blue-600 hover:text-blue-700 font-medium"
                >
                  Forgot Password?
                </button>
              </div>

              {/* Login Button */}
              <button
                type="submit"
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-4 rounded-lg transition duration-200 focus:ring-4 focus:ring-blue-200 outline-none mt-6"
              >
                Login
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
