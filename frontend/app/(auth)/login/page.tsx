"use client";
import { useState } from "react";
import {
  FaEye,
  FaEyeSlash
} from "react-icons/fa";
import { Mail, LockIcon } from "lucide-react";
import AuthLeftSection from "../components/AuthLeftSection";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { loginUser } from "@/lib/auth"; // 

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);

  const handleForgotPassword = () => {
    router.replace("/forgot-password");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const data = await loginUser(email, password);
      console.log("✅ Login success:", data);

      // redirect after successful login
      router.replace("/dashboard");
    } catch (error: any) {
      console.error("❌ Login failed:", error.message);
      alert(error.message); // You can replace with toast popup
    }
  };

  return (
    <div className="flex min-h-screen bg-gray-50 p-6">
      {/* <div className="flex w-full rounded-3xl overflow-hidden shadow-lg bg-white"> */}
      {/* Left Section - Reusable Component */}
      <AuthLeftSection />

      {/* Right Section */}
      <div className="flex flex-col justify-center items-center w-full lg:w-1/2 px-8 py-12">
        <div className="w-full max-w-sm">
          <Card className="border-0 shadow-none bg-gray">
            <CardHeader className="text-center ">
              <CardTitle className="font-inter text-[34px] font-bold text-[#171717]">
                Login
              </CardTitle>
              <p className="font-inter text-gray-500 text-[14px] font-normal">
                Welcome back! Please enter your details below.
              </p>
            </CardHeader>

            <CardContent className="">
              {/* Divider with text */}
              <div className="flex items-center my-3">
                <div className="flex-grow border-t border-[#E4E4E7]"></div>
                <span className="px-4 text-sm text-[#9C9C9C]">
                  Login with email
                </span>
                <div className="flex-grow border-t border-[#E4E4E7]"></div>
              </div>

              <form onSubmit={handleSubmit} className="space-y-5">
                {/* Email */}
                <div className="space-y-2 py-4">
                  <Label
                    htmlFor="email"
                    className="text-sm font-medium text-gray-700"
                  >
                    Email
                  </Label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Mail className="h-5 w-5 text-[#71717A]" />
                    </div>
                    <Input
                      id="email"
                      type="email"
                      placeholder="johnmiles@example.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="pl-10 pr-3 py-3 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-[#71717A] placeholder-[#71717A]"
                      required
                    />
                  </div>
                </div>

                {/* Password */}
                <div className="space-y-2">
                  <Label
                    htmlFor="password"
                    className="text-sm font-medium text-gray-700"
                  >
                    Password
                  </Label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <LockIcon className="h-5 w-5 text-[#71717A]" />
                    </div>
                    <Input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      placeholder="••••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="pl-10 pr-10 py-3 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-[#71717A] placeholder-[#71717A]"
                      required
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="absolute inset-y-0 right-0 pr-3 h-full text-[#71717A] hover:text-gray-600"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? (
                        <FaEyeSlash className="h-5 w-5" />
                      ) : (
                        <FaEye className="h-5 w-5" />
                      )}
                    </Button>
                  </div>
                </div>

                {/* Remember me + Forgot password */}
                <div className="flex items-center justify-between pt-2">
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="remember-me"
                      checked={rememberMe}
                      onCheckedChange={(checked) =>
                        setRememberMe(checked === true)
                      }
                      className="border-gray-300 data-[state=checked]:primary data-[state=checked]:border-blue-600"
                    />
                    <Label
                      htmlFor="remember-me"
                      className="text-sm text-gray-600 font-normal cursor-pointer"
                    >
                      Remember me
                    </Label>
                  </div>
                  <Button
                    type="button"
                    variant="link"
                    onClick={handleForgotPassword}
                    className="text-sm text-blue-600 primary hover:text-blue-700 font-medium p-0 h-auto"
                  >
                    Forgot Password?
                  </Button>
                </div>

                {/* Login Button */}
                <Button
                  type="submit"
                  className="w-full --primary hover:bg-blue-700 text-white font-semibold py-3 px-4 rounded-lg transition duration-200 focus:ring-4 focus:ring-blue-200 mt-6"
                >
                  Login
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
    // </div>
  );
}
