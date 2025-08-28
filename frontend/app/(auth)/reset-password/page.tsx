"use client";

import { useState } from "react";
import { X, Check } from "lucide-react";
import AuthLeftSection from "../components/AuthLeftSection";
import { useRouter } from "next/navigation";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function ResetPasswordPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    newPassword: "",
    confirmPassword: "",
  });
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [errors, setErrors] = useState({
    newPassword: "",
    confirmPassword: "",
  });

  // Password requirements
  const passwordRequirements = [
    { id: 1, text: "At least 6 Characters", met: false },
    { id: 2, text: "At least one capital letter", met: false },
    { id: 3, text: "At least one number", met: false },
    { id: 4, text: "At least one special character", met: false },
  ];

  // Check password requirements
  const checkPasswordRequirements = (password: string) => {
    return [
      password.length >= 6, // At least 6 characters
      /[A-Z]/.test(password), // At least one capital letter
      /\d/.test(password), // At least one number
      /[!@#$%^&*(),.?":{}|<>]/.test(password), // At least one special character
    ];
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));

    // Validate in real-time
    if (field === "newPassword") {
      const requirementsMet = checkPasswordRequirements(value);
      const newErrors = { ...errors };

      if (value && !requirementsMet.every((req) => req)) {
        newErrors.newPassword = "Password doesn't meet requirements";
      } else {
        newErrors.newPassword = "";
      }

      if (formData.confirmPassword && value !== formData.confirmPassword) {
        newErrors.confirmPassword = "Passwords do not match";
      } else if (
        formData.confirmPassword &&
        value === formData.confirmPassword
      ) {
        newErrors.confirmPassword = "";
      }

      setErrors(newErrors);
    }

    if (field === "confirmPassword" && formData.newPassword) {
      const newErrors = { ...errors };

      if (value !== formData.newPassword) {
        newErrors.confirmPassword = "Passwords do not match";
      } else {
        newErrors.confirmPassword = "";
      }

      setErrors(newErrors);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Validate form
    const requirementsMet = checkPasswordRequirements(formData.newPassword);
    const newErrors = {
      newPassword: "",
      confirmPassword: "",
    };

    let isValid = true;

    if (!formData.newPassword) {
      newErrors.newPassword = "New password is required";
      isValid = false;
    } else if (!requirementsMet.every((req) => req)) {
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

    if (isValid) {
      // Handle password reset logic here
      console.log("Password reset successful");
      alert("Password has been reset successfully!");
      router.push("/login");
    }
  };

  const handleBack = () => {
    router.back();
  };

  const requirementsMet = checkPasswordRequirements(formData.newPassword);

  return (
    <div className="flex min-h-screen bg-gray-50 p-6">
      {/* <div className="flex w-full rounded-3xl overflow-hidden shadow-lg bg-white"> */}
      {/* Left Section */}
      <AuthLeftSection />

      {/* Right Section - Reset Password */}
      <div className="flex flex-col justify-center items-center w-full lg:w-1/2 px-8 py-12">
        <div className="w-full max-w-sm">
          <h2 className="text-[32px] font-bold mb-2 text-gray-900">
            Reset Password
          </h2>
          <p className="text-gray-500 mb-8 text-[14px] font-normal">
            Create a new password
          </p>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* New Password */}
            <div className="space-y-2 w-[320px]">
              <Label
                htmlFor="password"
                className="text-sm font-medium text-gray-700"
              >
                New Password <span className="text-[#1379F2]"> *</span>
              </Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showNewPassword ? "text" : "password"}
                  placeholder="Password"
                  value={formData.newPassword}
                  onChange={(e) =>
                    handleInputChange("newPassword", e.target.value)
                  }
                  className=" border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-[#71717A] placeholder-[#71717A]"
                  required
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="absolute inset-y-0 right-0 pr-3 h-full text-[#71717A] hover:text-gray-600"
                  onClick={() => setShowNewPassword(!showNewPassword)}
                >
                  {showNewPassword ? (
                    <FaEyeSlash className="h-5 w-5" />
                  ) : (
                    <FaEye className="h-5 w-5" />
                  )}
                </Button>
              </div>
            </div>
            <div className="space-y-2 w-[320px]">
              <Label
                htmlFor="password"
                className="text-sm font-medium text-gray-700"
              >
                Confirm Password <span className="text-[#1379F2]"> *</span>
              </Label>
              <div className="relative">
                <Input
                  type={showConfirmPassword ? "text" : "password"}
                  placeholder="Password"
                  value={formData.confirmPassword}
                  onChange={(e) =>
                    handleInputChange("confirmPassword", e.target.value)
                  }
                  className="border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-[#71717A] placeholder-[#71717A]"
                  required
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="absolute inset-y-0 right-0 pr-3 h-full text-[#71717A] hover:text-gray-600"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                >
                  {showConfirmPassword ? (
                    <FaEyeSlash className="h-5 w-5" />
                  ) : (
                    <FaEye className="h-5 w-5" />
                  )}
                </Button>
              </div>
              {errors.confirmPassword && (
                <p className="text-red-500 text-sm mt-1">
                  {errors.confirmPassword}
                </p>
              )}
            </div>

            {/* Password Requirements */}
            <div className="w-[207px] border-[1px] p-4 rounded-lg ">
              <p className="text-sm font-medium text-gray-700 mb-2">
                Password must include:
              </p>
              <ul className="space-y-1">
                {passwordRequirements.map((req, index) => (
                  <li key={req.id} className="flex items-center">
                    {requirementsMet[index] ? (
                      <Check className="h-4 w-4 text-[#00B076] mr-2" />
                    ) : (
                      <X className="h-4 w-4 text-[#FF6767] mr-2" />
                    )}
                    <span
                      className={`text-xs ${
                        requirementsMet[index]
                          ? "text-[#00B076]"
                          : "text-[#FF6767]"
                      }`}
                    >
                      {req.text}
                    </span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="w-[320px] flex gap-[32px] mt-8">
              <Button
                type="button"
                onClick={handleBack}
                className="flex-1 w-[127px] h-[40px] bg-[#FFFFFF] py-3 px-4 border border-[#E4E4E7] text-gray-700 font-semibold rounded-lg hover:bg-gray-50 transition duration-200 focus:ring-2 focus:ring-gray-200 outline-none"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                className="flex-1 w-[183px] h-[40px] --primary hover:bg-blue-700 text-white font-semibold py-3 px-4 rounded-lg transition duration-200 focus:ring-4 focus:ring-blue-200 outline-none"
              >
                Submit
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
    // </div>
  );
}
