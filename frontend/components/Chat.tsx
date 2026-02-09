"use client";

import React, { useState, useRef, useEffect } from "react";
import { useFiles } from "@/contexts/FileContext";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Send, Paperclip } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function Chat() {
    const { selectedFile } = useFiles();
    const [msg, setMsg] = useState("");
    const scrollRef = useRef<HTMLDivElement>(null);

    // Auto-scroll chat to bottom whenever selected file changes
    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [selectedFile]);

    if (!selectedFile) {
        return (
            <div className="flex flex-col h-full bg-background/50 relative border-l min-h-0">
                <header className="h-14 border-b px-6 flex items-center justify-between bg-background/80 backdrop-blur-md sticky top-0 z-10">
                    <div className="flex items-center gap-3">
                        <div className="w-4 h-4 rounded-xl bg-blue-600 flex items-center justify-center shadow-lg shadow-blue-500/20" />
                        <div>
                            <h4 className="text-sm font-bold leading-none">Historick AI</h4>
                            <div className="flex items-center gap-1.5 mt-1">
                                <span className="h-1.5 w-1.5 rounded-full bg-gray-400" />
                                <span className="text-[10px] text-muted-foreground font-medium uppercase tracking-tight">Ready</span>
                            </div>
                        </div>
                    </div>
                </header>
                <div className="flex-1 flex items-center justify-center text-muted-foreground text-sm">
                    Select a document to start chatting
                </div>
            </div>
        );
    }

    return (
        <div className="flex flex-col h-full bg-background/50 relative border-l min-h-0">
            {/* Chat Header */}
            <header className="h-14 border-b px-6 flex items-center justify-between bg-background/80 backdrop-blur-md sticky top-0 z-10">
                <div className="flex items-center gap-3">
                    <div className="w-4 h-4 rounded-xl bg-blue-600 flex items-center justify-center shadow-lg shadow-blue-500/20" />
                    <div>
                        <h4 className="text-sm font-bold leading-none">Historick AI</h4>
                        <div className="flex items-center gap-1.5 mt-1">
                            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                            <span className="text-[10px] text-muted-foreground font-medium uppercase tracking-tight">Contextual Analysis</span>
                        </div>
                    </div>
                </div>
            </header>

            {/* Messages */}
            <div className="flex-1 px-6 overflow-auto min-h-0" ref={scrollRef}>
                <div className="max-w-2xl mx-auto py-8 space-y-8">
                    {/* Incoming Message Example */}
                    <div className="flex gap-4 items-start group">
                        <div className="h-4 w-4 rounded-xl animate-pulse bg-blue-600 flex items-center justify-center shrink-0 shadow-xl shadow-blue-500/10" />
                        <div className="space-y-2 flex-1">
                            <div className="bg-card border border-border/50 px-5 py-4 rounded-2xl rounded-tl-none text-[14.5px] leading-relaxed shadow-sm text-foreground/90">
                                Hi! I've indexed <strong>{selectedFile.name}</strong>. I can help you summarize the text, extract data, or explain complex concepts within this file.
                                <br /><br />
                                What would you like to know?
                            </div>
                            <p className="text-[10px] text-muted-foreground font-medium ml-1">AI ASSISTANT</p>
                        </div>
                    </div>

                    {/* Example user message (static placeholder) */}
                    {/* Add your dynamic message rendering here */}
                </div>
            </div>

            {/* Input Area */}
            <div className="p-6 bg-linear-to-t from-background via-background to-transparent sticky bottom-0">
                <div className="max-w-2xl mx-auto">
                    <div className="relative group transition-all duration-300">
                        <div className="absolute -inset-0.5 bg-linear-to-r from-blue-500 to-indigo-500 rounded-2xl blur opacity-10 group-focus-within:opacity-25 transition duration-1000"></div>
                        <div className="relative flex items-center p-2 bg-background border rounded-2xl shadow-xl">
                            <Button variant="ghost" size="icon" className="h-10 w-10 shrink-0 text-muted-foreground hover:bg-blue-50 hover:text-blue-600 transition-colors">
                                <Paperclip className="h-5 w-5" />
                            </Button>
                            <Input
                                placeholder={`Ask about ${selectedFile.name}...`}
                                value={msg}
                                onChange={(e) => setMsg(e.target.value)}
                                className="border-none bg-transparent shadow-none focus-visible:ring-0 h-10 text-sm placeholder:text-muted-foreground/60"
                            />
                            <AnimatePresence>
                                {msg.trim() && (
                                    <motion.div
                                        initial={{ scale: 0.8, opacity: 0 }}
                                        animate={{ scale: 1, opacity: 1 }}
                                        exit={{ scale: 0.8, opacity: 0 }}
                                    >
                                        <Button
                                            size="icon"
                                            className="h-10 w-10 rounded-xl bg-blue-600 hover:bg-blue-700 shadow-lg shadow-blue-500/20"
                                            onClick={() => {
                                                // wire your send action here
                                                console.log("Sending message:", msg);
                                                setMsg("");
                                            }}
                                        >
                                            <Send className="h-4 w-4" />
                                        </Button>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>
                    </div>
                    <p className="text-[10px] text-center text-muted-foreground/60 mt-3 font-medium">
                        AI Assistant is powered by Gemini 1.5 Pro • Feb 2026 Update
                    </p>
                </div>
            </div>
        </div>
    );
}