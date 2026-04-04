"use client";

/*
 * components/folder/file-sidebar.tsx
 * Thin sidebar — all state lives in useExplorerStore.
 * FolderRow and FileRow are small, focused components.
 */

import * as React from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import {
    ChevronRight,
    FolderOpen,
    Folder as FolderIcon,
    FolderPlus,
    Upload,
    Trash2,
    RefreshCw,
    MoreHorizontal,
    ExternalLink,
    BookOpen,
} from "lucide-react";

import {
    Sidebar,
    SidebarContent,
    SidebarHeader,
    SidebarGroup,
    SidebarGroupContent,
    SidebarMenu,
    SidebarMenuItem,
    SidebarMenuButton,
    SidebarMenuSub,
    SidebarMenuSubItem,
    SidebarMenuSubButton,
    SidebarMenuAction,
} from "@/components/ui/sidebar";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { getFileMetadata } from "@/components/folder/file-icons";
import { useExplorerStore, type FolderNode } from "@/store/explorer";
import type { FileT } from "@/types";

// Inline rename input (shared by folders and files)
function InlineRename({
    defaultValue,
    onSave,
    onCancel,
}: {
    defaultValue: string;
    onSave: (v: string) => Promise<void>;
    onCancel: () => void;
}) {
    const [value, setValue] = React.useState(defaultValue);
    const ref = React.useRef<HTMLInputElement>(null);

    React.useEffect(() => { ref.current?.select(); }, []);

    const commit = async () => {
        const next = value.trim();
        if (!next || next === defaultValue) return onCancel();
        await onSave(next);
    };

    return (
        <Input
            ref={ref}
            value={value}
            onChange={(e) => setValue(e.target.value)}
            onBlur={commit}
            onKeyDown={(e) => {
                e.stopPropagation();
                if (e.key === "Enter") { e.preventDefault(); commit(); }
                if (e.key === "Escape") { e.preventDefault(); onCancel(); }
            }}
            onClick={(e) => e.stopPropagation()}
            className="h-6 px-1.5 py-0 text-xs focus-visible:ring-1"
        />
    );
}

// FileRow
function FileRow({ file }: { file: FileT }) {
    const { icon: Icon, color } = getFileMetadata(file.file ?? undefined);
    const [renaming, setRenaming] = React.useState(false);
    const { setSelectedFileId, setPreviewFileId, renameFile, deleteFile } =
        useExplorerStore();

    const mediaUrl = file.file
        ? `${process.env.NEXT_PUBLIC_API_URL ?? ""}${file.file}`
        : null;

    return (
        <SidebarMenuSubItem>
            <SidebarMenuSubButton
                className="group/file gap-2"
                onClick={() => setSelectedFileId(file.id)}
                onDoubleClick={() => setPreviewFileId(file.id)}
            >
                <Icon className={cn("h-3.5 w-3.5 shrink-0", color)} />
                {renaming ? (
                    <InlineRename
                        defaultValue={file.name}
                        onSave={async (name) => {
                            await renameFile(file.id, name);
                            toast.success("File renamed");
                            setRenaming(false);
                        }}
                        onCancel={() => setRenaming(false)}
                    />
                ) : (
                    <span className="truncate text-xs">{file.name}</span>
                )}
            </SidebarMenuSubButton>

            {!renaming && (
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <SidebarMenuAction
                            showOnHover
                            className="opacity-0 transition-opacity group-hover/file:opacity-100"
                        >
                            <MoreHorizontal className="h-3.5 w-3.5" />
                        </SidebarMenuAction>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent side="right" align="start" className="w-44 text-xs">
                        <DropdownMenuItem onSelect={() => setPreviewFileId(file.id)}>
                            Open preview
                        </DropdownMenuItem>
                        {mediaUrl && (
                            <DropdownMenuItem asChild>
                                <a href={mediaUrl} target="_blank" rel="noopener noreferrer">
                                    <ExternalLink className="mr-2 h-3.5 w-3.5" />
                                    Open in new tab
                                </a>
                            </DropdownMenuItem>
                        )}
                        <DropdownMenuSeparator />
                        <DropdownMenuItem onSelect={() => setRenaming(true)}>
                            Rename
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                            onSelect={async () => {
                                await deleteFile(file.id);
                                toast.success("File deleted");
                            }}
                            className="text-destructive focus:text-destructive"
                        >
                            <Trash2 className="mr-2 h-3.5 w-3.5" />
                            Delete
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            )}
        </SidebarMenuSubItem>
    );
}

// FolderRow (recursive)
function FolderRow({ folder }: { folder: FolderNode }) {
    const router = useRouter();
    const [open, setOpen] = React.useState(false);
    const [renaming, setRenaming] = React.useState(false);
    const [addingChild, setAddingChild] = React.useState(false);
    const uploadRef = React.useRef<HTMLInputElement>(null);

    const {
        selectedFolderId,
        setSelectedFolderId,
        createFolder,
        renameFolder,
        deleteFolder,
        uploadFile,
    } = useExplorerStore();

    const hasChildren = folder.children.length > 0 || folder.files.length > 0;
    const isActive = selectedFolderId === folder.id;

    const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = Array.from(e.target.files ?? []);
        if (!files.length) return;
        try {
            await Promise.all(files.map((f) => uploadFile(f, folder.id)));
            toast.success(`${files.length} file(s) uploaded`);
        } catch {
            toast.error("Upload failed");
        } finally {
            e.target.value = "";
        }
    };

    return (
        <SidebarMenuItem>
            {/* Hidden file input scoped to this folder */}
            <input
                ref={uploadRef}
                type="file"
                multiple
                className="hidden"
                onChange={handleUpload}
            />

            <SidebarMenuButton
                isActive={isActive}
                tooltip={folder.path || folder.name}
                className="group/folder gap-1.5"
                onClick={() => {
                    setSelectedFolderId(folder.id);
                    if (hasChildren) setOpen((v) => !v);
                }}
                onDoubleClick={() => setRenaming(true)}
            >
                <ChevronRight
                    className={cn(
                        "h-3.5 w-3.5 shrink-0 text-muted-foreground transition-transform duration-150",
                        open && "rotate-90"
                    )}
                />
                {open ? (
                    <FolderOpen className="h-4 w-4 shrink-0 text-amber-400" />
                ) : (
                    <FolderIcon className="h-4 w-4 shrink-0 text-amber-400" />
                )}

                {renaming ? (
                    <InlineRename
                        defaultValue={folder.name}
                        onSave={async (name) => {
                            await renameFolder(folder.id, name);
                            toast.success("Folder renamed");
                            setRenaming(false);
                        }}
                        onCancel={() => setRenaming(false)}
                    />
                ) : (
                    <span className="truncate text-sm font-medium">{folder.name}</span>
                )}
            </SidebarMenuButton>

            {!renaming && (
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <SidebarMenuAction
                            showOnHover
                            className="opacity-0 transition-opacity group-hover/folder:opacity-100"
                        >
                            <MoreHorizontal className="h-3.5 w-3.5" />
                        </SidebarMenuAction>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent side="right" align="start" className="w-48 text-xs">
                        <DropdownMenuItem
                            onSelect={() => { setAddingChild(true); setOpen(true); }}
                        >
                            <FolderPlus className="mr-2 h-3.5 w-3.5" />
                            New subfolder
                        </DropdownMenuItem>
                        <DropdownMenuItem onSelect={() => uploadRef.current?.click()}>
                            <Upload className="mr-2 h-3.5 w-3.5" />
                            Upload file
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        {/* Create Notebook → navigates to /[notebookId]/ */}
                        <DropdownMenuItem
                            onSelect={() => router.push(folder.id)}
                        >
                            <BookOpen className="mr-2 h-3.5 w-3.5" />
                            Create Notebook
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem onSelect={() => setRenaming(true)}>
                            Rename
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                            onSelect={async () => {
                                if (!confirm(`Delete "${folder.name}" and all its contents?`)) return;
                                await deleteFolder(folder.id);
                                toast.success("Folder deleted");
                            }}
                            className="text-destructive focus:text-destructive"
                        >
                            <Trash2 className="mr-2 h-3.5 w-3.5" />
                            Delete
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            )}

            {open && (
                <SidebarMenuSub>
                    {/* Inline new-folder input */}
                    {addingChild && (
                        <SidebarMenuSubItem>
                            <div className="flex items-center gap-1.5 px-2 py-0.5">
                                <FolderIcon className="h-3.5 w-3.5 shrink-0 text-amber-400" />
                                <InlineRename
                                    defaultValue=""
                                    onSave={async (name) => {
                                        await createFolder(name, folder.id);
                                        toast.success("Folder created");
                                        setAddingChild(false);
                                    }}
                                    onCancel={() => setAddingChild(false)}
                                />
                            </div>
                        </SidebarMenuSubItem>
                    )}

                    {folder.children.map((child) => (
                        <FolderRow key={child.id} folder={child} />
                    ))}

                    {folder.files.map((file) => (
                        <FileRow key={file.id} file={file} />
                    ))}
                </SidebarMenuSub>
            )}
        </SidebarMenuItem>
    );
}

// FileSidebar
export function FileSidebar() {
    const { tree, loading, fetch, setSelectedFolderId, selectedFolderId } =
        useExplorerStore();
    const [creatingRoot, setCreatingRoot] = React.useState(false);
    const { createFolder } = useExplorerStore();

    // Fetch once on mount
    React.useEffect(() => { fetch(); }, [fetch]);
    return (
        <Sidebar collapsible="icon" className="border-r border-border/50">
            {/* Sidebar Header */}
            <SidebarHeader className="border-b border-border/50 px-3 py-2">
                <div className="flex items-center justify-between">

                    {/* App Title */}
                        <a href="#" className="flex items-center gap-2 font-medium">
                            <span className="bg-primary text-primary-foreground flex size-6 items-center justify-center rounded-md">
                                HI
                            </span>
                            Historick AI
                        </a>

                    {/* Action Buttons */}
                    <div className="flex items-center gap-0.5">
                        {/* New Folder Button */}
                        <Tooltip>
                            <TooltipTrigger asChild>
                                <button
                                    onClick={() => setCreatingRoot(true)}
                                    className="flex h-6 w-6 items-center justify-center rounded hover:bg-accent text-muted-foreground hover:text-foreground"
                                >
                                    <FolderPlus className="h-3.5 w-3.5" />
                                </button>
                            </TooltipTrigger>
                            <TooltipContent side="bottom">New folder</TooltipContent>
                        </Tooltip>
                        
                        {/* Refresh Button */}
                        <Tooltip>
                            <TooltipTrigger asChild>
                                <button
                                    onClick={fetch}
                                    className="flex h-6 w-6 items-center justify-center rounded hover:bg-accent text-muted-foreground hover:text-foreground"
                                >
                                    <RefreshCw className="h-3.5 w-3.5" />
                                </button>
                            </TooltipTrigger>
                            <TooltipContent side="bottom">Refresh</TooltipContent>
                        </Tooltip>
                    </div>
                </div>
            </SidebarHeader>

            {/* Sidebar Content */}
            <SidebarContent>
                <SidebarGroup className="py-1">
                    <SidebarGroupContent>
                        <SidebarMenu>
                            {/* Root folder creation input */}
                            {creatingRoot && (
                                <SidebarMenuItem>
                                    <div className="flex items-center gap-1.5 px-2 py-0.5">
                                        <FolderIcon className="h-4 w-4 shrink-0 text-amber-400" />
                                        <InlineRename
                                            defaultValue=""
                                            onSave={async (name) => {
                                                await createFolder(name, null);
                                                toast.success("Folder created");
                                                setCreatingRoot(false);
                                            }}
                                            onCancel={() => setCreatingRoot(false)}
                                        />
                                    </div>
                                </SidebarMenuItem>
                            )}

                            {loading ? (
                                <SidebarMenuItem>
                                    <SidebarMenuButton disabled className="text-xs text-muted-foreground">
                                        Loading…
                                    </SidebarMenuButton>
                                </SidebarMenuItem>
                            ) : tree.length === 0 && !creatingRoot ? (
                                <SidebarMenuItem>
                                    <div className="px-3 py-6 text-center">
                                        <FolderIcon className="mx-auto mb-2 h-8 w-8 text-muted-foreground/30" />
                                        <p className="text-xs text-muted-foreground">No folders yet</p>
                                        <button
                                            onClick={() => setCreatingRoot(true)}
                                            className="mt-2 text-xs text-primary hover:underline"
                                        >
                                            Create one
                                        </button>
                                    </div>
                                </SidebarMenuItem>
                            ) : (
                                tree.map((folder) => (
                                    <FolderRow key={folder.id} folder={folder} />
                                ))
                            )}
                        </SidebarMenu>
                    </SidebarGroupContent>
                </SidebarGroup>
            </SidebarContent>
        </Sidebar>
    );
}