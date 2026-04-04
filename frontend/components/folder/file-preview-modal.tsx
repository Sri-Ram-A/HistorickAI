"use client";

/*
 * components/folder/file-preview-modal.tsx
 * Full-screen modal that opens when a user double-clicks a file.
 * Driven entirely by previewFileId in the Zustand store.
 * Supports: PDF (iframe), images, and a fallback "open in new tab" for others.
 */

import { ExternalLink, X } from "lucide-react";
import {
    Dialog,
    DialogContent,
    DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { getFileMetadata } from "@/components/folder/file-icons";
import { useExplorerStore } from "@/store/explorer";
import { BASE_URL } from "@/routes";
// Helpers
function getExtension(url: string): string {
    return url.split(".").pop()?.toLowerCase() ?? "";
}

const IMAGE_EXTS = new Set(["png", "jpg", "jpeg", "gif", "webp", "svg"]);
const PDF_EXTS = new Set(["pdf"]);

// FilePreviewModal
export function FilePreviewModal() {
    const { previewFileId, previewFile, setPreviewFileId } = useExplorerStore();
    const file = previewFile();
    const open = !!previewFileId && !!file;
    const mediaUrl = file?.file
        ? `${BASE_URL ?? ""}${file.file}`
        : null;

    const ext = mediaUrl ? getExtension(mediaUrl) : "";
    const isImage = IMAGE_EXTS.has(ext);
    const isPdf = PDF_EXTS.has(ext);
    const { icon: FileIcon, color } = getFileMetadata(file?.file ?? undefined);

    return (
        <Dialog open={open} onOpenChange={(v) => { if (!v) setPreviewFileId(null); }}>
            {/*
                DialogContent is made full-screen via className overrides.
                The shadcn Dialog already dims the background with its overlay.
            */}
            <DialogContent
                className={cn(
                    "max-w-none w-screen h-screen p-0 rounded-none border-0",
                    "flex flex-col bg-background"
                )}
                // Hide the default close button — we render our own in the header bar
                showCloseButton={false}
            >

                {/* Top bar */}
                <div className="flex items-center gap-3 border-b border-border px-4 py-3 shrink-0">
                    <FileIcon className={cn("h-4 w-4 shrink-0", color)} />

                    <DialogTitle className="flex-1 truncate text-sm font-medium">
                        {file?.name ?? "Preview"}
                    </DialogTitle>

                    {mediaUrl && (
                        <Button variant="ghost" size="sm" asChild className="gap-1.5 text-xs">
                            <a href={mediaUrl} target="_blank" rel="noopener noreferrer">
                                <ExternalLink className="h-3.5 w-3.5" />
                                Open in new tab
                            </a>
                        </Button>
                    )}

                    <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7 shrink-0"
                        onClick={() => setPreviewFileId(null)}
                    >
                        <X className="h-4 w-4" />
                        <span className="sr-only">Close</span>
                    </Button>
                </div>


                {/* Content area*/}

                <div className="flex-1 overflow-hidden">
                    {!mediaUrl ? (
                        <Unsupported message="No file URL available." />
                    ) : isPdf ? (
                        // Django sets X_FRAME_OPTIONS = "ALLOWALL" so this works
                        <iframe
                            src={mediaUrl}
                            className="h-full w-full border-0"
                            title={file?.name}
                        />
                    ) : isImage ? (
                        <div className="flex h-full w-full items-center justify-center p-8 bg-muted/30">
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img
                                src={mediaUrl}
                                alt={file?.name}
                                className="max-h-full max-w-full object-contain rounded shadow-lg"
                            />
                        </div>
                    ) : (
                        <Unsupported
                            message={`Preview not available for .${ext} files.`}
                            href={mediaUrl}
                        />
                    )}
                </div>
            </DialogContent>
        </Dialog>
    );
}

// Fallback
function Unsupported({ message, href }: { message: string; href?: string }) {
    return (
        <div className="flex h-full flex-col items-center justify-center gap-4 text-muted-foreground">
            <p className="text-sm">{message}</p>
            {href && (
                <Button variant="outline" size="sm" asChild>
                    <a href={href} target="_blank" rel="noopener noreferrer">
                        <ExternalLink className="mr-2 h-3.5 w-3.5" />
                        Open in new tab
                    </a>
                </Button>
            )}
        </div>
    );
}