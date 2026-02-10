"use client"

import React from "react"
import { AppSidebar } from "@/components/app-sidebar"
import { Toaster } from "@/components/ui/sonner"
import { Sun, Moon } from "lucide-react";
import { useTheme } from "next-themes";
import {
    SidebarProvider,
    SidebarInset,
    SidebarTrigger,
} from "@/components/ui/sidebar"
import { Button } from "@/components/ui/button";

export default function CitizenLayout({
    children,
}: {
    children: React.ReactNode
}) {
    const { theme, setTheme } = useTheme();

    return (
        <SidebarProvider>
            {/* Sidebar */}
            <AppSidebar />

            <SidebarInset className="flex min-h-screen flex-col">
                {/* HEADER */}
                <SidebarTrigger className="h-9 w-9 bg-accent rounded-4xl fixed top-2 left-2 z-50" />
                <Button className="h-9 w-9 bg-accent-foreground rounded-4xl fixed top-2 right-2 z-50" onClick={() => setTheme(theme === "dark" ? "light" : "dark")}>
                    {theme === "dark" ? (
                        <Sun className="h-4 w-4" />
                    ) : (
                        <Moon className="h-4 w-4" />
                    )}
                </Button>
                {/* PAGE CONTENT */}
                <main className="flex-1 p-4">
                    {children}
                </main>
                <Toaster />
            </SidebarInset>
        </SidebarProvider>
    )
}
