"use client";

import { useState } from "react";
import { Eye, EyeOff, Check } from "lucide-react";
import AuthLeftSection from "../components/AuthLeftSection";
import { useRouter } from "next/navigation";

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
      <div className="flex w-full rounded-3xl overflow-hidden shadow-lg bg-white">
        {/* Left Section */}
        <AuthLeftSection />

        {/* Right Section - Reset Password */}
        <div className="flex flex-col justify-center items-center w-full lg:w-1/2 px-8 py-12">
          <div className="w-full max-w-sm">
            <h2 className="text-[34px] font-bold mb-2 text-gray-900">
              Reset Password
            </h2>
            <p className="text-gray-500 mb-8 text-[14px] font-normal">
              Create a new password
            </p>

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* New Password */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  New Password *
                </label>
                <div className="relative">
                  <input
                    type={showNewPassword ? "text" : "password"}
                    placeholder="Password"
                    value={formData.newPassword}
                    onChange={(e) =>
                      handleInputChange("newPassword", e.target.value)
                    }
                    className={`block w-full pr-10 pl-3 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-colors ${
                      errors.newPassword ? "border-red-500" : "border-gray-300"
                    }`}
                  />
                  <button
                    type="button"
                    className="absolute inset-y-0 right-0 pr-3 flex items-center"
                    onClick={() => setShowNewPassword(!showNewPassword)}
                  >
                    {showNewPassword ? (
                      <EyeOff className="h-5 w-5 text-gray-400" />
                    ) : (
                      <Eye className="h-5 w-5 text-gray-400" />
                    )}
                  </button>
                </div>
                {errors.newPassword && (
                  <p className="text-red-500 text-sm mt-1">
                    {errors.newPassword}
                  </p>
                )}
              </div>

              {/* Confirm Password */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Confirm Password *
                </label>
                <div className="relative">
                  <input
                    type={showConfirmPassword ? "text" : "password"}
                    placeholder="Password"
                    value={formData.confirmPassword}
                    onChange={(e) =>
                      handleInputChange("confirmPassword", e.target.value)
                    }
                    className={`block w-full pr-10 pl-3 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-colors ${
                      errors.confirmPassword
                        ? "border-red-500"
                        : "border-gray-300"
                    }`}
                  />
                  <button
                    type="button"
                    className="absolute inset-y-0 right-0 pr-3 flex items-center"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  >
                    {showConfirmPassword ? (
                      <EyeOff className="h-5 w-5 text-gray-400" />
                    ) : (
                      <Eye className="h-5 w-5 text-gray-400" />
                    )}
                  </button>
                </div>
                {errors.confirmPassword && (
                  <p className="text-red-500 text-sm mt-1">
                    {errors.confirmPassword}
                  </p>
                )}
              </div>

              {/* Password Requirements */}
              <div className="bg-gray-50 p-4 rounded-lg">
                <p className="text-sm font-medium text-gray-700 mb-2">
                  Password must include:
                </p>
                <ul className="space-y-1">
                  {passwordRequirements.map((req, index) => (
                    <li key={req.id} className="flex items-center">
                      <div
                        className={`w-4 h-4 rounded-full flex items-center justify-center mr-2 ${
                          requirementsMet[index]
                            ? "bg-green-500"
                            : "bg-gray-300"
                        }`}
                      >
                        {requirementsMet[index] && (
                          <Check className="h-3 w-3 text-white" />
                        )}
                      </div>
                      <span
                        className={`text-xs ${
                          requirementsMet[index]
                            ? "text-green-600"
                            : "text-gray-500"
                        }`}
                      >
                        {req.text}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Buttons */}
              <div className="flex gap-4 mt-6">
                <button
                  type="button"
                  onClick={handleBack}
                  className="flex-1 py-3 px-4 border border-gray-300 text-gray-700 font-semibold rounded-lg hover:bg-gray-50 transition duration-200 focus:ring-2 focus:ring-gray-200 outline-none"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-4 rounded-lg transition duration-200 focus:ring-4 focus:ring-blue-200 outline-none"
                >
                  Submit
                </button>
              </div>
            </form>

          </div>
        </div>
      </div>
    </div>
  );
}
