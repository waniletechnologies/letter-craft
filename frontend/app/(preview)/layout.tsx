"use client";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import Image from "next/image";
import Link from "next/link";
import { Logo } from "@/public/images";
import { LogOut } from "lucide-react";
import Loader from "@/components/Loader";

const dashboardLink = [
  { label: "Dashboard", href: "/dashboard" },
  { label: "Clients", href: "/clients" },
  { label: "Letter Library", href: "/letters" },
  { label: "Creditors", href: "/credit-reports" },
];

function getUserInitials(name?: string) {
  if (!name) return "U";
  const parts = name.split(" ");
  if (parts.length === 1) return parts[0][0].toUpperCase();
  return (parts[0][0] + parts[1][0]).toUpperCase();
}

const AvatarPlaceholder = ({ initials }: { initials: string }) => (
  <div className="h-8 w-8 rounded-full bg-primary flex items-center justify-center shadow-sm">
    <span className="text-white text-xs font-semibold tracking-wide">
      {initials}
    </span>
  </div>
);

const PreviewLayout: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const router = useRouter();
  const [user, setUser] = useState<{
    name: string;
    email: string;
    image?: string;
  } | null>(null);

  useEffect(() => {
    async function fetchUser() {
      try {
        const res = await getCurrentUser();
        setUser(res.user);
      } catch (err) {
        console.error("Failed to fetch user:", err);
        router.replace("/login");
      }
    }
    fetchUser();
  }, [router]);

  if (!user) return <Loader />;

  const handleLogout = () => {
    router.replace("/login");
  };

  return (
    <>
      {/* Header */}
      <div className="bg-transparent sm:bg-[#FFFFFF] w-full h-[60px] flex justify-between items-center py-1 px-4 sm:px-14 border-b border-[#EAEAEA]">
        {/* Logo */}
        <div className="flex items-center gap-2">
          <Image
            src={Logo}
            alt="logo"
            className="w-6 h-6 sm:w-[111px] sm:h-8"
          />
        </div>

        {/* Desktop Nav Links */}
        <div className="hidden sm:flex justify-center items-center gap-10">
          {dashboardLink.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="font-medium text-sm text-[#A3A3A3] hover:text-primary"
            >
              {link.label}
            </Link>
          ))}
        </div>

        {/* User Info & Notifications */}
        <div className="flex items-center gap-3">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <div className="flex items-center gap-2 cursor-pointer hover:bg-gray-50 rounded-lg p-1 transition-colors duration-200">
                <Avatar className="h-8 w-8">
                  {user.image ? (
                    <AvatarImage src={user.image} alt={user.name} />
                  ) : (
                    <AvatarFallback className="bg-transparent p-0">
                      <AvatarPlaceholder
                        initials={getUserInitials(user.name)}
                      />
                    </AvatarFallback>
                  )}
                </Avatar>
                <span className="hidden sm:inline text-sm font-medium text-[#171717]">
                  {user.name}
                </span>
              </div>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-68 p-2">
              {/* User Info */}
              <div className="px-3 py-3 border-b border-gray-100">
                <div className="flex items-center gap-2">
                  <Avatar className="h-10 w-10">
                    {user.image ? (
                      <AvatarImage src={user.image} alt={user.name} />
                    ) : (
                      <AvatarFallback className="bg-transparent p-0">
                        <AvatarPlaceholder
                          initials={getUserInitials(user.name)}
                        />
                      </AvatarFallback>
                    )}
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-gray-900 truncate">
                      {user.name}
                    </p>
                    <p className="text-xs text-gray-500 truncate">
                      {user.email}
                    </p>
                  </div>
                </div>
              </div>

              {/* Logout */}
              <div className="py-1">
                <div className="my-1 border-t border-gray-100" />
                <DropdownMenuItem
                  onClick={handleLogout}
                  className="flex items-center gap-3 px-3 py-2.5 text-sm text-red-600 hover:bg-red-50 hover:text-red-700 cursor-pointer"
                >
                  <LogOut className="h-4 w-4 text-red-500" />
                  <span>Log out</span>
                </DropdownMenuItem>
              </div>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Content */}
      <div className="bg-white sm:px-12 sm:py-6 px-4 py-2 w-full h-full flex flex-col gap-4">
        {children}
      </div>
    </>
  );
};

export default PreviewLayout;
