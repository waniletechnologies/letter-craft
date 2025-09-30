"use client";

import React, { useEffect, useState } from "react";
import { getCurrentUser } from "@/lib/auth";
import { usePathname, useRouter } from "next/navigation";
import {
  LayoutDashboard,
  LogOut,
  Settings,
  CreditCard,
  NotebookPen,
  FileChartColumnIncreasing,
} from "lucide-react";
import { motion } from "framer-motion";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "../../components/ui/dropdown-menu";
import { LuSparkle, LuWand } from "react-icons/lu";
import { GoCheckCircle } from "react-icons/go";
import { AppSidebar } from "../../components/AppSidebar";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "../../components/ui/sidebar";
import Loader from "@/components/Loader";

// --------------------------------------
// Navigation config
// --------------------------------------
const MAIN_LINKS = [
  {
    href: "/dashboard",
    label: "Dashboard",
    icon: LayoutDashboard,
  },
  {
    href: "/documents",
    label: "Documents",
    icon: NotebookPen,
  },
  {
    href: "/researcher-gpt",
    label: "Researcher GPT",
    icon: LuWand,
  },
  {
    href: "/compliance-testing",
    label: "Compliance Testing",
    icon: GoCheckCircle,
  },
  {
    href: "/data-validator",
    label: "Data Validator",
    icon: FileChartColumnIncreasing,
  },
  {
    href: "/custom-gpt",
    label: "Custom GPT",
    icon: LuSparkle,
  },
];

const SUPPORT_LINKS = [
  {
    href: "/subscription",
    label: "Subscription",
    icon: CreditCard,
  },
  {
    href: "/settings",
    label: "Settings",
    icon: Settings,
  },
];

// --------------------------------------
// Helpers
// --------------------------------------
const getHeadingForPath = (pathname: string) => {
  const found = [...MAIN_LINKS, ...SUPPORT_LINKS].find(
    (l) => l.href === pathname
  );
  if (found) return found.label;
  // fallback → take the next segment and capitalise return previous segment + next segment
  const segments = pathname.split("/").filter(Boolean);
  // only add next segment if present
  if (segments[1]) {
    return (
      segments[0]?.replace(/-/g, " ").charAt(0).toUpperCase() +
      segments[0]?.replace(/-/g, " ").slice(1) +
      " / " +
      segments[1]?.replace(/-/g, " ").charAt(0).toUpperCase() +
      segments[1]?.replace(/-/g, " ").slice(1)
    );
  }
  return (
    segments[0]?.replace(/-/g, " ").charAt(0).toUpperCase() +
    segments[0]?.replace(/-/g, " ").slice(1)
  );
};

const AvatarPlaceholder = ({ initials }: { initials: string }) => (
  <div className="h-8 w-8 rounded-full bg-primary flex items-center justify-center shadow-sm">
    <span className="text-white text-xs font-semibold tracking-wide">
      {initials}
    </span>
  </div>
);

// Layout
// --------------------------------------
const SBProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <SidebarProvider>
    <DashboardLayout>{children}</DashboardLayout>
  </SidebarProvider>
);

function getUserInitials(name?: string) {
  if (!name) return "U";
  const parts = name.split(" ");
  if (parts.length === 1) return parts[0][0].toUpperCase();
  return (parts[0][0] + parts[1][0]).toUpperCase();
}

const DashboardLayout: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const pathname = usePathname();
  const router = useRouter();
  const heading = getHeadingForPath(pathname);
  const currentLink = [...MAIN_LINKS, ...SUPPORT_LINKS].find(
    (l) => l.href === pathname
  );
  const HeadingIcon = currentLink?.icon ?? LayoutDashboard;

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

  const handleLogout = () => {
    router.replace("/login");
  };

  if (!user) {
    return <Loader />;
  }

  return (
    <>
      <AppSidebar />
      <SidebarInset>
        <motion.div className="flex flex-1 flex-col">
          {/* Header */}
          <header className="flex h-16 w-full items-center bg-white gap-2">
            <div className="flex items-center gap-2 ml-6">
              <SidebarTrigger />
              <span className="h-6 w-px bg-[#D7D7D7] -ml-2" />
              <HeadingIcon className="h-5 w-5 text-[#3D3D3D]" />
              <h1 className="tracking-tighter text-[#3D3D3D] capitalize text-sm lg:text-base font-normal">
                {heading}
              </h1>
            </div>

            <div className="ml-auto flex items-center gap-2">
              
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
          </header>
          <main className="flex-1 px-6 py-4">{children}</main>
        </motion.div>
      </SidebarInset>
    </>
  );
};

export default SBProvider;
