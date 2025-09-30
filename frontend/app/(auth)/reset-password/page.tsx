"use client";

import { useState, Suspense } from "react";
import { X, Check } from "lucide-react";
import AuthLeftSection from "../components/AuthLeftSection";
import { useRouter, useSearchParams } from "next/navigation";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { resetPassword } from "@/lib/auth";
import { toast } from "sonner";

function ResetPasswordForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const email = searchParams.get("email") || "";
  const code = searchParams.get("code") || "";

  const [formData, setFormData] = useState({
    newPassword: "",
    confirmPassword: "",
  });
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [errors, setErrors] = useState({
    newPassword: "",
    confirmPassword: "",
    api: "",
  });
  const [loading, setLoading] = useState(false);

  const passwordRequirements = [
    { id: 1, text: "At least 6 Characters" },
    { id: 2, text: "At least one capital letter" },
    { id: 3, text: "At least one number" },
    { id: 4, text: "At least one special character" },
  ];

  const checkPasswordRequirements = (password: string) => [
    password.length >= 6,
    /[A-Z]/.test(password),
    /\d/.test(password),
    /[!@#$%^&*(),.?":{}|<>]/.test(password),
  ];

  const requirementsMet = checkPasswordRequirements(formData.newPassword);

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    setErrors((prev) => ({ ...prev, api: "" }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email || !code) {
      setErrors((prev) => ({
        ...prev,
        api: "Invalid reset link. Please request again.",
      }));
      return;
    }

    const newErrors = { newPassword: "", confirmPassword: "", api: "" };
    let isValid = true;

    if (!formData.newPassword) {
      newErrors.newPassword = "New password is required";
      isValid = false;
    } else if (!requirementsMet.every((r) => r)) {
      newErrors.newPassword = "Password doesn't meet requirements";
      isValid = false;
    }

    if (!formData.confirmPassword) {
      newErrors.confirmPassword = "Please confirm your password";
      isValid = false;
    } else if (formData.newPassword !== formData.confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match";
      isValid = false;
    }

    setErrors(newErrors);
    if (!isValid) return;

    setLoading(true);
    try {
      const res = await resetPassword(email, code, formData.newPassword);

      if (res.ok) {
        toast.success("Password reset successful!");
        router.push("/successful");
      } else {
        setErrors((prev) => ({ ...prev, api: res.message || "Reset failed" }));
        toast.error("Password reset failed. Please try again.");
      }
    } catch (err) {
      console.error(err);
      setErrors((prev) => ({ ...prev, api: "Something went wrong" }));
      toast.error("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleBack = () => router.back();

  return (
    <div className="flex min-h-screen bg-gray-50 p-4 sm:p-6">
      {/* Left Section - Hidden on small, visible on lg */}
      <div className="hidden lg:flex">
        <AuthLeftSection />
      </div>

      {/* Right Section */}
      <div className="flex flex-col justify-center items-center w-full lg:w-1/2 px-4 sm:px-8 py-8 sm:py-12">
        <div className="w-full max-w-md">
          <h2 className="text-[28px] sm:text-[32px] font-bold mb-2 text-gray-900">
            Reset Password
          </h2>
          <p className="text-gray-500 mb-8 text-[14px] font-normal">
            Create a new password
          </p>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* New Password */}
            <div className="space-y-2 w-full">
              <Label htmlFor="newPassword">New Password *</Label>
              <div className="relative">
                <Input
                  id="newPassword"
                  type={showNewPassword ? "text" : "password"}
                  placeholder="Enter new password"
                  value={formData.newPassword}
                  onChange={(e) =>
                    handleInputChange("newPassword", e.target.value)
                  }
                  className="border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  required
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="absolute inset-y-0 right-0 pr-3 h-full text-gray-500"
                  onClick={() => setShowNewPassword(!showNewPassword)}
                >
                  {showNewPassword ? <FaEyeSlash /> : <FaEye />}
                </Button>
              </div>
              {errors.newPassword && (
                <p className="text-red-500 text-sm">{errors.newPassword}</p>
              )}
            </div>

            {/* Confirm Password */}
            <div className="space-y-2 w-full">
              <Label htmlFor="confirmPassword">Confirm Password *</Label>
              <div className="relative">
                <Input
                  id="confirmPassword"
                  type={showConfirmPassword ? "text" : "password"}
                  placeholder="Confirm password"
                  value={formData.confirmPassword}
                  onChange={(e) =>
                    handleInputChange("confirmPassword", e.target.value)
                  }
                  className="border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  required
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="absolute inset-y-0 right-0 pr-3 h-full text-gray-500"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                >
                  {showConfirmPassword ? <FaEyeSlash /> : <FaEye />}
                </Button>
              </div>
              {errors.confirmPassword && (
                <p className="text-red-500 text-sm">{errors.confirmPassword}</p>
              )}
            </div>

            {/* Password Requirements */}
            <div className="w-full border p-4 rounded-lg">
              <p className="text-sm font-medium text-gray-700 mb-2">
                Password must include:
              </p>
              <ul className="space-y-1">
                {passwordRequirements.map((req, i) => (
                  <li key={req.id} className="flex items-center">
                    {requirementsMet[i] ? (
                      <Check className="h-4 w-4 text-green-500 mr-2" />
                    ) : (
                      <X className="h-4 w-4 text-red-500 mr-2" />
                    )}
                    <span
                      className={`text-xs ${
                        requirementsMet[i] ? "text-green-500" : "text-red-500"
                      }`}
                    >
                      {req.text}
                    </span>
                  </li>
                ))}
              </ul>
            </div>

            {errors.api && (
              <p className="text-red-500 text-sm mt-2">{errors.api}</p>
            )}

            {/* Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 mt-6">
              <Button
                type="button"
                onClick={handleBack}
                variant="outline"
                className="flex-1"
              >
                Cancel
              </Button>
              <Button type="submit" className="flex-1" disabled={loading}>
                {loading ? "Submitting..." : "Submit"}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={
      <div className="flex min-h-screen bg-gray-50 p-6">
        <AuthLeftSection />
        <div className="flex flex-col justify-center items-center w-full lg:w-1/2 px-8 py-12">
          <div className="w-full max-w-sm">
            <div className="animate-pulse">
              <div className="h-8 bg-gray-200 rounded mb-2"></div>
              <div className="h-4 bg-gray-200 rounded mb-8"></div>
              <div className="space-y-6">
                <div className="h-10 bg-gray-200 rounded"></div>
                <div className="h-10 bg-gray-200 rounded"></div>
                <div className="h-32 bg-gray-200 rounded"></div>
                <div className="h-10 bg-gray-200 rounded"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    }>
      <ResetPasswordForm />
    </Suspense>
  );
}
