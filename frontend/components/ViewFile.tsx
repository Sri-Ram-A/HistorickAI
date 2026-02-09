"use client";

import { useFiles } from "@/contexts/FileContext";
import { getFileMetadata } from "@/components/folder/folder-tree";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ExternalLink } from "lucide-react";

export default function ViewFile() {
    const { selectedFile } = useFiles();

    if (!selectedFile) {
        return (
            <div className="h-full flex flex-col items-center justify-center text-center p-8 bg-dot-black/[0.05]">
                <div className="p-6 bg-linear-to-t from-indigo-800 to-sky-300 rounded-3xl mb-6 ring-1 ring-blue-500/20 shadow-inner">
                    <img src="images/select-to-begin.png" className="h-100" />
                </div>
                <h2 className="text-2xl font-bold tracking-tight text-foreground/80">No Document Selected</h2>
                <p className="text-muted-foreground max-w-75 mt-2">
                    Pick a file from the sidebar to begin your AssIsted studies.
                </p>
            </div>
        );
    }

    const { url, type } = getFileMetadata(selectedFile.file);

    return (
        <div className="flex flex-col h-full min-h-0">

            {/* File Header */}
            <div className="h-14 border-b bg-background/60 backdrop-blur-xl px-4 flex items-center justify-between sticky top-0 z-10">
                <div className="flex items-center gap-3 overflow-hidden">
                    <Badge variant="outline" className="bg-blue-50 text-blue-600 border-blue-200 uppercase text-[10px] font-bold">
                        {type}
                    </Badge>
                    <h3 className="text-sm font-semibold truncate max-w-50">{selectedFile.name}</h3>
                </div>
                <div className="flex items-center gap-1">
                    <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground" asChild>
                        <a href={url} target="_blank" rel="noreferrer"><ExternalLink className="h-4 w-4" /></a>
                    </Button>
                </div>
            </div>

            {/* File Display */}
            <div className="w-full h-full border rounded shadow-2xl bg-white">
                {type === "pdf" ? (
                    <iframe src={`${url}#toolbar=0`} className="w-full h-full border-none" title="PDF Preview" />
                ) : (
                    <div className="h-full flex items-center justify-center p-4">
                        <img src={url} className="max-h-full max-w-full object-contain drop-shadow-md" alt="Preview" />
                    </div>
                )}
            </div>
        </div>
    );
}