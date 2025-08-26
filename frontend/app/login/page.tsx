"use client";
import { useState } from "react";
import { Mail, Lock, Eye } from "lucide-react";
import Image from "next/image";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  return (
    <div className="flex min-h-screen bg-gray-50 p-6">
      <div className="flex w-full rounded-3xl overflow-hidden shadow-lg">
        {/* Left Section */}
        <div className="hidden lg:flex flex-col justify-between w-1/2 relative">
          {/* Background Image */}
          <Image
            src="/Background.jpg" // put your image in /public/login-bg.jpg
            alt="Background"
            fill
            className="object-cover"
            priority
          />
          <div className="absolute inset-0 bg-black/20 rounded-l-3xl"></div>

          {/* Content */}
          <div className="flex flex-col justify-between h-full p-12 relative z-10">
            <div className="text-2xl font-bold tracking-wide text-white">
              LetterCraft
            </div>

            {/* Bottom text */}
            <div className="mt-auto">
              <h1 className="text-4xl font-bold mb-4 leading-tight text-white">
                Your credit history, <br /> simplified and verified.
              </h1>
              <p className="text-white/90 text-base leading-relaxed">
                Lorem ipsum dolor sit amet, consectetur <br />
                adipiscing elit. Pellentesque at.
              </p>
            </div>

            {/* Slider dots */}
            <div className="flex gap-2 mt-10">
              <span className="w-8 h-2 rounded-full bg-white"></span>
              <span className="w-2 h-2 rounded-full bg-white/40"></span>
              <span className="w-2 h-2 rounded-full bg-white/40"></span>
            </div>
          </div>
        </div>

        {/* Right Section */}
        <div className="flex flex-col justify-center items-center w-full lg:w-1/2 px-8 py-12">
          <div className="w-full max-w-sm">
            <h2 className="text-3xl font-bold mb-2 text-gray-900 text-center">Login</h2>
            <p className="text-gray-500 mb-2 text-sm">
              Welcome back! Please enter your details below.
            </p>

            <div className="text-xs text-gray-400 mb-8">Login with email</div>

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
                    className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none text-gray-900 placeholder-gray-400"
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
                    className="block w-full pl-10 pr-10 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none text-gray-900 placeholder-gray-400"
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
                <a
                  href="#"
                  className="text-sm text-blue-600 hover:text-blue-700 font-medium"
                >
                  Forgot Password?
                </a>
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
