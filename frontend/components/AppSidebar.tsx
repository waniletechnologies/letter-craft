import { usePathname, useRouter } from "next/navigation";
import { useTransition } from "react";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
  useSidebar,
} from "./ui/sidebar";
import Link from "next/link";
import Image from "next/image";
import {
  LayoutDashboard,
} from "lucide-react";
import { motion } from "framer-motion";
import {Logo, Upload} from "@/public/images";
import { FiUsers } from "react-icons/fi";
import { LuCircleSlash, LuFileChartColumnIncreasing, LuSendHorizontal } from "react-icons/lu";
import { Button } from "./ui/button";

const MAIN_LINKS = [
  {
    href: "/dashboard",
    label: "Dashboard",
    icon: LayoutDashboard,
  },
  {
    href: "/clients",
    label: "Clients",
    icon: FiUsers,
  },
  {
    href: "/credit-reports",
    label: "Credit Reports",
    icon: LuFileChartColumnIncreasing,
  },
  {
    href: "/disputes",
    label: "Disputes",
    icon: LuCircleSlash,
  },
  {
    href: "/letters",
    label: "Letters",
    icon: LuSendHorizontal,
  },
];

const MotionSidebarMenuButton = motion(SidebarMenuButton);

function SidebarLink({
  href,
  label,
  icon: Icon,
  isActive,
  state,
}: Readonly<{
  href: string;
  label: string;
  icon: React.ElementType;
  isActive: boolean;
  state: string;
}>) {
  const { setOpenMobile, isMobile } = useSidebar();
  const router = useRouter();
  const [, startTransition] = useTransition();

  const handleClick = () => {
    startTransition(() => {
      router.push(href);
    });
    if (isMobile) {
      setOpenMobile(false);
    }
  };

  return (
    <div className="min-w-0 relative">
      <SidebarMenuItem key={href}>
        <MotionSidebarMenuButton
          onClick={handleClick}
          className={`relative text-sm ${state == "collapsed" ? "rounded-full p-4" : "rounded-md p-5"} flex justify-start items-center leading-10 w-full min-w-0`}
          style={{ maxWidth: 256 }}
          animate={{
            backgroundColor: isActive ? "#2196F3" : "transparent",
            color: isActive ? "white" : "#848484",
          }}
          transition={{ type: "spring", stiffness: 400, damping: 30 }}
        >
          <Icon className="h-6 w-6 flex-shrink-0" />
          {state !== "collapsed" && (
            <div className="flex items-center min-w-0 w-full">
              <span
                className="flex-1 text-left truncate overflow-hidden whitespace-nowrap min-w-0"
                style={{ minWidth: 0 }}
              >
                {label}
              </span>
            </div>
          )}
        </MotionSidebarMenuButton>
      </SidebarMenuItem>
    </div>
  );
}

export function AppSidebar({ ...props }) {
  const { state, setOpenMobile, isMobile } = useSidebar();
  const pathname = usePathname();

  const isTabActive = (tabPath: string) => pathname === tabPath;

  const handleFooterClick = () => {
    if (isMobile) {
      setOpenMobile(false);
    }
  };

  const handleLogoClick = () => {
    if (isMobile) {
      setOpenMobile(false);
    }
  };

  return (
    <Sidebar className="bg-white min-w-0 max-w-xs" collapsible="icon" {...props}>
      <SidebarHeader className="bg-white">
        <SidebarMenu>
          <SidebarMenuItem
            className={`${state === "collapsed" ? "px-3" : "px-5"} py-3`}
          >
            <Link href={"/dashboard"} className="flex items-center gap-2" onClick={handleLogoClick}>
              <Image src={Logo} alt="LetterCraft" width={111} height={32} />
            </Link>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent
        className={`${state != "collapsed" ? "pt-5 px-2" : "pt-6"} gap-0 bg-white`}
      >
        <SidebarGroup>
          <SidebarMenu className="gap-2 m-0">
            {MAIN_LINKS.map(({ href, label, icon: Icon }) => (
              <SidebarLink
                key={href}
                href={href}
                label={label}
                icon={Icon}
                isActive={isTabActive(href)}
                state={state}
              />
            ))}
          </SidebarMenu>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter className="bg-white">
        {state !== "collapsed" && (
          <Link href="/chat" onClick={handleFooterClick}>
            <div
              className="mx-auto mb-10 w-[175px] h-[179px] rounded-md overflow-hidden flex justify-center cursor-pointer bg-[#2196F30F] hover:opacity-90 transition-opacity"
            >
              <div className="p-4 flex flex-col items-center justify-center gap-2">
                <Image src={Upload} alt="LetterCraft" width={29} height={25} />
                <p className="font-semibold text-[11px] leading-[11px] -tracking-[0.03em] text-[#3D3D3D] ">
                Import Your Credit Report
                </p>
                <span className="text-[#3D3D3DB2]/70 font-medium text-[11px] leading-[11px] -tracking-[0.03em] ">Drag & Drop or</span>
                <Button className="bg-primary text-white w-full cursor-pointer">Browse</Button>
              </div>
            </div>
          </Link>
        )}
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}


