"use client"

import * as React from "react"
import { useTheme } from "next-themes"
import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarFooter,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarRail,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarGroupContent,
} from "@/components/ui/sidebar"
import { Home, Info, Palette, Sun, Moon, Sparkles } from "lucide-react"
import { FolderTree } from "@/components/reusables/folder-tree"
import { cn } from "@/lib/utils"

export function AppSidebar(props: React.ComponentProps<typeof Sidebar>) {
  const { theme, setTheme } = useTheme()

  const navItems = [
    { title: "Home", url: "", icon: Home },
    { title: "About Us", url: "/about", icon: Info },
    { title: "Activities", url: "/activities", icon: Palette },
  ]

  return (
    <Sidebar collapsible="icon" {...props} className={cn("bg-white dark:bg-slate-900")}>
      <SidebarHeader className=" border-b ">
        <div className="flex items-center gap-2 font-semibold">
          <span className="bg-primary text-primary-foreground flex size-6 items-center justify-center rounded-sm">
            HI
          </span>
          <span className="group-data-[state=collapsed]:hidden">
            Historick AI
          </span>
        </div>
      </SidebarHeader>

      <SidebarContent>

        <SidebarMenu>
          {navItems.map((item) => (
            <SidebarMenuItem key={item.title}>
              <SidebarMenuButton asChild tooltip={item.title}>
                <a href={item.url} className="flex items-center gap-2">
                  <item.icon className="h-4 w-4" />
                  <span>{item.title}</span>
                </a>
              </SidebarMenuButton>
            </SidebarMenuItem>
          ))}
        </SidebarMenu>

        <SidebarGroup >
          <SidebarGroupLabel className="flex items-center justify-between group-data-[state=collapsed]:hidden">
            <span>Folders</span>
          </SidebarGroupLabel>

          <SidebarGroupContent>
            <div className="p-1/2">
              <FolderTree />
            </div>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="border-t">
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              tooltip="Toggle Theme"
              onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
            >
              {theme === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
              <span>Theme</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>

      <SidebarRail />
    </Sidebar>
  )
}
export default AppSidebar
