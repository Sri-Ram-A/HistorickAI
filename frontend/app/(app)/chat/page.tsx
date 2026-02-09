"use client";

import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from "@/components/ui/resizable";
import ViewFile from "@/components/ViewFile";
import Chat from "@/components/Chat";

export default function ChatPage() {
    return (
        <main className="h-full bg-background overflow-hidden flex flex-col">
            
            {/* Visible only in Mobile size (single-column) */}
            <div className="mobile rounded border flex flex-col h-full md:hidden">
                <ResizablePanelGroup orientation="vertical">
                    <ResizablePanel defaultSize={50}>
                        <ViewFile />
                    </ResizablePanel>
                    <ResizableHandle withHandle className="bg-border/40 hover:bg-blue-500/40 transition-all" />
                    <ResizablePanel defaultSize={50}>
                        <Chat />
                    </ResizablePanel>
                </ResizablePanelGroup>
            </div>

            {/* Visible only in Desktop (two-column resizable) */}
            <div className="hidden md:block h-full">
                <ResizablePanelGroup orientation="horizontal" className="h-full items-stretch">
                    <ResizablePanel defaultSize={75} minSize={30}>
                        <ViewFile />
                    </ResizablePanel>
                    <ResizableHandle withHandle className="w-1 bg-border/40 hover:bg-blue-500/40 transition-all" />
                    <ResizablePanel defaultSize={25} minSize={30}>
                        <Chat />
                    </ResizablePanel>
                </ResizablePanelGroup>
            </div>
        </main>
    );
}