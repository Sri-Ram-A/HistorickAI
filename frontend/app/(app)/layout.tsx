"use client"

import React from "react"
import { AppSidebar } from "@/components/app-sidebar"
import { Toaster } from "@/components/ui/sonner"

import {
    SidebarProvider,
    SidebarInset,
    SidebarTrigger,
} from "@/components/ui/sidebar"

import { Separator } from "@/components/ui/separator"

export default function CitizenLayout({
    children,
}: {
    children: React.ReactNode
}) {
    return (
        <SidebarProvider>
            {/* Sidebar */}
            <AppSidebar />
            <SidebarInset className="flex min-h-screen flex-col">
                {/* HEADER */}
                <header className="flex h-14 items-center border-b bg-background">
                    <div className="z-10">
                        <SidebarTrigger className="h-9 w-9 hover:bg-muted" />
                    </div>
                </header>
                
                {/* PAGE CONTENT */}
                <main className="flex-1 p-4">
                    {children}
                </main>
                <Toaster />
            </SidebarInset>
        </SidebarProvider>
    )
}
