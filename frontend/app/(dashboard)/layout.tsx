"use client";

import React, { useEffect, useState } from "react";
import Image from "next/image";
import { getCurrentUser } from "@/lib/auth";
import { usePathname, useRouter } from "next/navigation";
import {
  LayoutDashboard,
  ChevronDown,
  LogOut,
  Settings,
  CreditCard,
  NotebookPen,
  FileChartColumnIncreasing,
} from "lucide-react";
import { motion } from "framer-motion";
import { Button } from "../../components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "../../components/ui/dropdown-menu";
import { LuSparkle, LuWand } from "react-icons/lu";
import { GoCheckCircle } from "react-icons/go";
import { AppSidebar } from "../../components/AppSidebar";
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
  useSidebar,
} from "../../components/ui/sidebar";

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
    (l) => l.href === pathname,
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
    return <div className="p-6">Loading...</div>;
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
                  <Button variant="ghost" className="flex items-center gap-1">
                    <div className="flex items-center gap-2 cursor-pointer hover:bg-gray-50 rounded-lg p-1 transition-colors duration-200">
                      <div className="h-8 w-8 rounded-full bg-gray-200 flex items-center justify-center overflow-hidden">
                        {user.image ? (
                          <Image
                            src={user.image}
                            alt={user.name}
                            width={40}
                            height={40}
                            className="object-cover"
                          />
                        ) : (
                          <span className="text-sm font-semibold text-gray-600">
                            {getUserInitials(user.name)}
                          </span>
                        )}
                      </div>
                      <span className="hidden md:inline text-sm ml-1 font-medium text-foreground">
                        {user.name}
                      </span>
                      <ChevronDown className="hidden md:inline h-4 w-4 text-muted-foreground" />
                    </div>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent
                  align="end"
                  className="w-fit z-50 bg-white"
                >
                  <DropdownMenuLabel className="text-xs">
                    {user.email}
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    onClick={handleLogout}
                    className="gap-2 text-[11px] cursor-pointer"
                  >
                    <LogOut className="h-3 w-3" /> Log out
                  </DropdownMenuItem>
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
