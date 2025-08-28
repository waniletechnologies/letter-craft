"use client"

import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import Image from "next/image";
import Link from "next/link";
import { Logo } from "@/public/images";
import { FiBell } from "react-icons/fi";
import { LogOut } from "lucide-react";



const dashboardLink = [
    {
        label: "Dashboard",
        href: "/dashboard"
    },
    
    {
        label: "Clients",
        href: "/clients"
    },
    
    {
        label: "Letter Library",
        href: "/letters"
    },
    {
        label: "Creditors",
        href: "/credit-reports"
    },
    
    
    
]

const AvatarPlaceholder = ({ initials }: { initials: string }) => (
    <div className="h-8 w-8 rounded-full bg-primary flex items-center justify-center shadow-sm">
      <span className="text-white text-xs font-semibold tracking-wide">
        {initials}
      </span>
    </div>
  );

const PreviewLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {


    const handleLogout = () => {
        console.log("logout");
      };

  return (
    <>
    <div className="bg-transparent sm:bg-[#FFFFFF] w-full h-[60px] flex justify-between items-center py-1 px-4 sm:px-14 border-b border-[#EAEAEA]">
              <div className="flex items-center gap-2">
                <div className="flex gap-1 items-center">
                    <Image src={Logo} alt="logo" className="w-6 h-6 sm:w-[111px] sm:h-8" />
                </div>
              </div>
                <div className="hidden sm:flex justify-center items-center gap-10">
                    {dashboardLink.map((link) => (
                        <Link href={link.href} key={link.href} className="font-geist font-medium text-sm leading-[18.93px] -tracking-[0.03em] text-[#A3A3A3] hover:text-primary ">
                            {link.label}
                        </Link>
                    ))}
                    
                </div>

                <div className="flex justify-center items-center gap-3">
                      <FiBell className="w-4 h-4" />
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <div className="flex items-center gap-2 cursor-pointer hover:bg-gray-50 rounded-lg p-1 transition-colors duration-200">
                          <Avatar className="h-8 w-8">
                            <AvatarImage
                              src={""}
                              alt="Profile picture"
                            />
                            <AvatarFallback className="bg-transparent p-0">
                              <AvatarPlaceholder initials={'JD'} />
                            </AvatarFallback>
                          </Avatar>
                          <span className="hidden sm:inline text-sm font-medium text-[#171717]">
                            {'John Doe'}
                          </span>
                        </div>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="w-68 p-2">
                        {/* User Info Section */}
                        <div className="px-3 py-3 border-b border-gray-100">
                          <div className="flex items-center gap-2">
                            <Avatar className="h-10 w-10">
                              <AvatarImage
                                src={""}
                                alt="Profile picture"
                              />
                              <AvatarFallback className="bg-transparent p-0">
                                <AvatarPlaceholder initials={'JD'} />
                              </AvatarFallback>
                            </Avatar>
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-semibold text-gray-900 truncate">
                                {'John Doe'}
                              </p>
                              <p className="text-xs text-gray-500 gap-[2px] flex items-center truncate">
                                <span className="text-gray-500 text-[12px] font-semibold tracking-[-1%]">{'Free Plan'}.</span>
                                {'user@example.com'}
                              </p>
                            </div>
                          </div>
                        </div>

                        {/* Menu Items */}
                        <div className="py-1">
                          
                          
                          {/* Divider */}
                          <div className="my-1 border-t border-gray-100" />
                          
                          {/* Logout Button */}
                          <DropdownMenuItem
                            onClick={handleLogout}
                            className="flex items-center gap-3 px-3 py-2.5 text-sm text-red-600 hover:bg-red-50 hover:text-red-700 cursor-pointer transition-colors duration-150"
                          >
                            <LogOut className="h-4 w-4 text-red-500" />
                            <span>Log out</span>
                          </DropdownMenuItem>
                        </div>
                      </DropdownMenuContent>
                    </DropdownMenu>
                </div>
            </div>
            <div className="bg-white px-12 py-6 w-full h-full flex flex-col gap-4">
                {children}
            </div>
    </>
  );
};

export default PreviewLayout;