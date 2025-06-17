"use client"
import Link from "next/link";
import { useState } from "react";
import { motion } from "framer-motion";
import { Video, Timer, BookOpen, Info, ChevronLeft } from "lucide-react";
import { cn } from "@/lib/utils"; // Ensure this utility works properly
import { SidebarLinkProps } from "@/types";
const Logo = () => (
  <div className="font-normal flex items-center gap-3 text-sm py-1 relative z-20">
    <div className="h-8 w-8 bg-gradient-to-br from-purple-500 to-blue-500 rounded-xl flex-shrink-0" />
    <motion.span
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="text-lg font-semibold bg-gradient-to-r from-purple-600 to-blue-600 text-transparent bg-clip-text"
    >
      Historick AI
    </motion.span>
  </div>
);

const LogoIcon = () => (
  <div className="font-normal flex items-center text-sm py-1 relative z-20">
    <div className="h-8 w-8 bg-gradient-to-br from-purple-500 to-blue-500 rounded-xl flex-shrink-0" />
  </div>
);



const SidebarLink = ({ link, isCollapsed }: SidebarLinkProps) => {
  return (
    <Link
      href={link.href}
      onClick={link.onClick}
      className={cn(
        "flex items-center gap-3 w-full",
        "px-3 py-2 rounded-lg transition-all duration-200",
        "text-gray-700 hover:text-purple-600",
        "hover:bg-purple-50 active:bg-purple-100",
        "dark:text-gray-200 dark:hover:text-purple-400 dark:hover:bg-purple-500/10"
      )}
    >
      {link.icon}
      {!isCollapsed && (
        <span className="text-sm font-medium whitespace-nowrap">{link.label}</span>
      )}
    </Link>
  );
};


export function CustomSidebar() {
  const [isCollapsed, setIsCollapsed] = useState(false);

  const links = [
    {
      label: "Generate Video",
      icon: <Video className="w-5 h-5" />,
      href: "/video_generator",  // Example path for Generate Video page
    },
    {
      label: "Generate Timeline",
      icon: <Timer className="w-5 h-5" />,
      href: "/timeline",  // Path for Generate Timeline page
    },
    {
      label: "Take A Quiz",
      icon: <BookOpen className="w-5 h-5" />,
      href: "/quiz",  // Path for Quiz page
    },
    {
      label: "About",
      icon: <Info className="w-5 h-5" />,
      href: "/about",  // Path for About page
    },
  ];

  return (
    <motion.div
      animate={{ width: isCollapsed ? 80 : 280 }}
      className={cn(
        "h-screen bg-white dark:bg-gray-900",
        "border-r border-gray-200 dark:border-gray-800",
        "flex flex-col p-4 relative",
        "shadow-sm"
      )}
    >
      <div className="flex justify-between items-center mb-8 pr-2">
        {isCollapsed ? <LogoIcon /> : <Logo />}
        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className={cn(
            "p-2 rounded-lg transition-colors duration-200",
            "text-gray-500 hover:text-purple-600",
            "hover:bg-purple-50 active:bg-purple-100",
            "dark:text-gray-400 dark:hover:text-purple-400 dark:hover:bg-purple-500/10"
          )}
        >
          <ChevronLeft className={cn(
            "h-5 w-5 transition-transform duration-300",
            isCollapsed && "rotate-180"
          )} />
        </button>
      </div>

      <div className="flex flex-col gap-2">
        {links.map((link, idx) => (
          <SidebarLink 
            key={idx} 
            link={link} 
            isCollapsed={isCollapsed}
          />
        ))}
      </div>

      <div className="mt-auto pt-4 border-t border-gray-100 dark:border-gray-800">
        <div className={cn(
          "flex items-center gap-3 px-3 py-2",
          "text-sm text-gray-500 dark:text-gray-400"
        )}>
          {isCollapsed ? (
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-500 to-blue-500" />
          ) : (
            <>
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-500 to-blue-500" />
              <div className="flex flex-col">
                <span className="font-medium text-gray-700 dark:text-gray-200">User Name</span>
                <span className="text-xs">user@example.com</span>
              </div>
            </>
          )}
        </div>
      </div>
    </motion.div>
  );
}
