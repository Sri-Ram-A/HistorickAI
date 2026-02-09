"use client";

import React, { useState, useRef, useEffect } from "react";
import { useFiles } from "@/contexts/FileContext";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Send, Paperclip, Loader2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { REQUEST } from "@/routes";
import ReactMarkdown from "react-markdown";

interface Message {
    id: string;
    role: "user" | "assistant";
    content: string;
    created_at?: string;
}

export default function Chat() {
    const { selectedFile, selectedFolder } = useFiles();
    const [msg, setMsg] = useState("");
    const [messages, setMessages] = useState<Message[]>([]);
    const [sessionFolderId, setSessionFolderId] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);
    const [loadingHistory, setLoadingHistory] = useState(false);
    const scrollRef = useRef<HTMLDivElement>(null);

    // Auto-scroll chat to bottom whenever messages change
    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [messages]);

    // Load session history when folder changes
    useEffect(() => {
        if (selectedFolder) {
            loadSessionHistory(selectedFolder.id);
        } else {
            setMessages([]);
            setSessionFolderId(null);
        }
    }, [selectedFolder]);

    const loadSessionHistory = async (folderId: string) => {
        setLoadingHistory(true);
        try {
            const response = await REQUEST("GET", `chat/session/${folderId}/history/`);

            if (response.messages && response.messages.length > 0) {
                setMessages(response.messages);
                setSessionFolderId(response.session_folder_id);
            } else {
                // No existing session, will create on first message
                setMessages([]);
                setSessionFolderId(null);
            }
        } catch (error) {
            console.error("Failed to load session history:", error);
            // If session doesn't exist yet, that's fine
            setMessages([]);
            setSessionFolderId(null);
        } finally {
            setLoadingHistory(false);
        }
    };

    const handleSendMessage = async () => {
        if (!msg.trim() || !selectedFile) return;

        const userMessage = msg.trim();
        setMsg("");
        setLoading(true);

        // Add user message to UI immediately
        const tempUserMsg: Message = {
            id: `temp-${Date.now()}`,
            role: "user",
            content: userMessage,
        };
        setMessages((prev) => [...prev, tempUserMsg]);

        try {
            let response;

            if (!sessionFolderId) {
                // First message - start new session
                response = await REQUEST("POST", "chat/start_session/", {
                    source_folder_id: selectedFolder.id,
                    message: userMessage,
                });

                // Store session folder ID for subsequent messages
                setSessionFolderId(response.session_folder_id);
            } else {
                // Continuing conversation - send to existing session
                response = await REQUEST("POST", "chat/message/", {
                    session_folder_id: sessionFolderId,
                    message: userMessage,
                });
            }

            // Add AI response to messages
            const aiMessage: Message = {
                id: response.message_id || `ai-${Date.now()}`,
                role: "assistant",
                content: response.ai_response,
            };

            setMessages((prev) => [...prev, aiMessage]);
        } catch (error: any) {
            console.error("Failed to send message:", error);

            // Add error message
            const errorMessage: Message = {
                id: `error-${Date.now()}`,
                role: "assistant",
                content: "I apologize, but I encountered an error processing your request. Please try again.",
            };
            setMessages((prev) => [...prev, errorMessage]);
        } finally {
            setLoading(false);
        }
    };

    const handleKeyPress = (e: React.KeyboardEvent) => {
        if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            handleSendMessage();
        }
    };

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
                                <span className="text-[10px] text-muted-foreground font-medium uppercase tracking-tight">
                                    Ready
                                </span>
                            </div>
                        </div>
                    </div>
                </header>
                <div className="flex-1 flex items-center justify-center text-muted-foreground text-sm">
                    Select a folder to start chatting
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
                            <span className="text-[10px] text-muted-foreground font-medium uppercase tracking-tight">
                                {selectedFile.name}
                            </span>
                        </div>
                    </div>
                </div>
            </header>

            {/* Messages */}
            <div className="flex-1 px-6 overflow-auto min-h-0" ref={scrollRef}>
                <div className="max-w-2xl mx-auto py-8 space-y-6">
                    {loadingHistory ? (
                        <div className="flex items-center justify-center py-12">
                            <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
                        </div>
                    ) : messages.length === 0 ? (
                        // Welcome message
                        <div className="flex gap-4 items-start group">
                            <div className="h-4 w-4 rounded-xl animate-pulse bg-blue-600 flex items-center justify-center shrink-0 shadow-xl shadow-blue-500/10" />
                            <div className="space-y-2 flex-1">
                                <div className="bg-card border border-border/50 px-5 py-4 rounded-2xl rounded-tl-none text-[14.5px] leading-relaxed shadow-sm text-foreground/90">
                                    Hi! I'm ready to help you analyze and discuss your documents.
                                    <br /><br />
                                    What would you like to know?
                                </div>
                                <p className="text-[10px] text-muted-foreground font-medium ml-1">
                                    AI ASSISTANT
                                </p>
                            </div>
                        </div>
                    ) : (
                        // Render messages
                        messages.map((message, index) => (
                            <div
                                key={message.id || index}
                                className={`flex gap-4 items-start group ${message.role === "user" ? "flex-row-reverse" : ""
                                    }`}
                            >
                                {message.role === "assistant" && (
                                    <div className="h-4 w-4 rounded-xl animate-pulse bg-blue-600 flex items-center justify-center shrink-0 shadow-xl shadow-blue-500/10" />
                                )}
                                {message.role === "user" && (
                                    <div className="h-4 w-4 rounded-xl bg-slate-600 dark:bg-slate-400 flex items-center justify-center shrink-0" />
                                )}
                                <div className="space-y-2 flex-1 max-w-[80%]">
                                    <div
                                        className={`px-5 py-4 rounded-2xl text-[14.5px] leading-relaxed shadow-sm ${message.role === "user"
                                            ? "bg-primary text-primary-foreground rounded-tr-none ml-auto"
                                            : "bg-card border border-border/50 text-foreground/90 rounded-tl-none"
                                            }`}
                                    >
                                        {message.role === "assistant" ? (
                                            <div className="prose prose-sm dark:prose-invert max-w-none">
                                                <ReactMarkdown
                                                    components={{
                                                        p: ({ children }) => <p className="mb-2 last:mb-0">{children}</p>,
                                                        ul: ({ children }) => <ul className="list-disc ml-4 mb-2">{children}</ul>,
                                                        ol: ({ children }) => <ol className="list-decimal ml-4 mb-2">{children}</ol>,
                                                        code: ({ children }) => (
                                                            <code className="bg-muted px-1.5 py-0.5 rounded text-sm">
                                                                {children}
                                                            </code>
                                                        ),
                                                        pre: ({ children }) => (
                                                            <pre className="bg-muted p-3 rounded-lg overflow-x-auto mb-2">
                                                                {children}
                                                            </pre>
                                                        ),
                                                    }}
                                                >
                                                    {message.content}
                                                </ReactMarkdown>
                                            </div>
                                        ) : (
                                            message.content
                                        )}
                                    </div>
                                    <p className={`text-[10px] text-muted-foreground font-medium ${message.role === "user" ? "text-right mr-1" : "ml-1"
                                        }`}>
                                        {message.role === "user" ? "YOU" : "AI ASSISTANT"}
                                    </p>
                                </div>
                            </div>
                        ))
                    )}

                    {/* Loading indicator */}
                    {loading && (
                        <div className="flex gap-4 items-start">
                            <div className="h-4 w-4 rounded-xl animate-pulse bg-blue-600 flex items-center justify-center shrink-0 shadow-xl shadow-blue-500/10" />
                            <div className="space-y-2 flex-1">
                                <div className="bg-card border border-border/50 px-5 py-4 rounded-2xl rounded-tl-none text-[14.5px] leading-relaxed shadow-sm">
                                    <div className="flex items-center gap-2 text-muted-foreground">
                                        <Loader2 className="w-4 h-4 animate-spin" />
                                        <span>Thinking...</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Input Area */}
            <div className="p-6 bg-gradient-to-t from-background via-background to-transparent sticky bottom-0">
                <div className="max-w-2xl mx-auto">
                    <div className="relative group transition-all duration-300">
                        <div className="absolute -inset-0.5 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-2xl blur opacity-10 group-focus-within:opacity-25 transition duration-1000"></div>
                        <div className="relative flex items-center p-2 bg-background border rounded-2xl shadow-xl">
                            <Button
                                variant="ghost"
                                size="icon"
                                className="h-10 w-10 shrink-0 text-muted-foreground hover:bg-blue-50 hover:text-blue-600 transition-colors"
                            >
                                <Paperclip className="h-5 w-5" />
                            </Button>
                            <Input
                                placeholder={`Ask about ${selectedFile.name}...`}
                                value={msg}
                                onChange={(e) => setMsg(e.target.value)}
                                onKeyDown={handleKeyPress}
                                disabled={loading}
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
                                            onClick={handleSendMessage}
                                            disabled={loading}
                                        >
                                            {loading ? (
                                                <Loader2 className="h-4 w-4 animate-spin" />
                                            ) : (
                                                <Send className="h-4 w-4" />
                                            )}
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