"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Accordion, AccordionItem, AccordionTrigger, AccordionContent, } from "@/components/ui/accordion";
import { ContextMenu, ContextMenuTrigger, ContextMenuContent, ContextMenuItem, ContextMenuSeparator, } from "@/components/ui/context-menu";
import { Dialog, DialogContent, DialogHeader, DialogTitle, } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { FileUpload } from "@/components/ui/file-upload";
import { EditableText } from "@/components/folder/editable-text";
import {
    FileText, FileImage, Presentation, FileCode, File as FileIcon, FileType, Edit3, ExternalLink, Folder as FolderIcon, Plus, UploadCloud, Trash2, Maximize2, Download, Video, Send, Paperclip
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useFiles } from "@/contexts/FileContext";
import { FileT, FolderT } from "@/types";
import { BASE_URL } from "@/routes";

export const getFileMetadata = (fileUrl?: string) => {
    if (!fileUrl) return { url: "", type: "unknown", icon: FileIcon };
    // Clean URL construction
    const cleanBase = BASE_URL;
    const fullUrl = fileUrl.startsWith("http") ? fileUrl : `${cleanBase}${fileUrl}`;
    const ext = fileUrl.split('.').pop()?.toLowerCase();
    if (fileUrl.includes("youtube.com") || fileUrl.includes("youtu.be") || fileUrl.includes("you")) {
        return { url: fullUrl, type: "youtube", icon: Video };
    }
    switch (ext) {
        case "pdf": return { url: fullUrl, type: "pdf", icon: FileText };
        case "pptx": case "ppt": return { url: fullUrl, type: "pptx", icon: Presentation };
        case "png": case "jpg": case "jpeg": case "gif": return { url: fullUrl, type: "image", icon: FileImage };
        case "docx": case "doc": return { url: fullUrl, type: "docx", icon: FileType };
        case "txt": return { url: fullUrl, type: "txt", icon: FileCode };
        default: return { url: fullUrl, type: "file", icon: FileIcon };
    }
};

// File Component
function File({
    file,
    editingId,
    onStartEdit,
    parentFolder
}: {
    file: FileT;
    editingId: string | null;
    onStartEdit: (id: string) => void;
    parentFolder: FolderT;
}) {
    const { setSelectedFile, selectedFile, deleteFile,setSelectedFolder } = useFiles();
    // Check if this specific file is the one currently active in the chat
    const isActive = selectedFile?.id === file.id;
    const isEditing = editingId === file.id;
    const { type, icon: Icon } = getFileMetadata(file.file);
    const handleFileSelection = () => {
        setSelectedFolder(parentFolder); // ⭐ critical
        setSelectedFile(file);
    };

    return (
        <ContextMenu>
            <ContextMenuTrigger>
                <motion.div
                    whileHover={{ x: 2 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={handleFileSelection}
                    onKeyDown={(e) => {
                        if (e.key === "F2" && !isEditing) onStartEdit(file.id);
                        if (e.key === "Enter") handleFileSelection();
                    }}
                    tabIndex={0}
                    className={`
                        group flex items-center gap-3 px-3 py-2.5 rounded-xl cursor-pointer transition-all outline-none
                        ${isActive
                            ? "bg-blue-500/10 text-blue-600 dark:bg-blue-500/20 shadow-sm"
                            : "hover:bg-accent/60 text-muted-foreground hover:text-foreground"}
                    `}
                >
                    {/* File Icon with Status Indicator */}
                    <div className="relative">
                        <Icon className={`h-4 w-4 ${isActive ? "text-blue-600" : "text-blue-500/70"}`} />
                        {isActive && (
                            <span className="absolute -top-1 -right-1 flex h-2 w-2">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                                <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-500"></span>
                            </span>
                        )}
                    </div>

                    {/* File Info */}
                    <div className="flex-1 min-w-0">
                        <span className={`text-sm font-medium truncate block ${isActive ? "text-blue-700 dark:text-blue-400" : ""}`}>
                            {file.name}
                        </span>
                        <span className="text-[10px] opacity-60 uppercase tracking-wider font-bold">
                            {type}
                        </span>
                    </div>

                    {/* Quick Action Visual Cue */}
                    <div className="flex items-center opacity-0 group-hover:opacity-100 transition-opacity">
                        <Maximize2 className="h-3 w-3" />
                    </div>
                </motion.div>
            </ContextMenuTrigger>

            <ContextMenuContent className="w-52">
                <ContextMenuItem onSelect={handleFileSelection} className="gap-2">
                    <Maximize2 className="h-4 w-4" /> Open in Editor
                </ContextMenuItem>

                <ContextMenuItem onSelect={() => onStartEdit(file.id)} className="gap-2">
                    <Edit3 className="h-4 w-4" /> Rename
                </ContextMenuItem>

                <ContextMenuSeparator />

                <ContextMenuItem
                    onSelect={() => deleteFile(file.id)}
                    className="text-destructive focus:text-destructive gap-2"
                >
                    <Trash2 className="h-4 w-4" /> Delete File
                </ContextMenuItem>
            </ContextMenuContent>

        </ContextMenu>
    );
}

// Folder Component
function Folder({
    folder,
    editingId,
    setEditingId,
}: {
    folder: FolderT;
    editingId: string | null;
    setEditingId: (id: string | null) => void;
}) {
    const { renameFolder, deleteFolder, createFile } = useFiles();
    const [uploadOpen, setUploadOpen] = React.useState(false);
    const router = useRouter();
    const isFolderEditing = editingId === folder.id;

    const handleUpload = async (files: File[]) => {
        if (!files.length) return;
        await Promise.all(files.map((f) => createFile(f, folder.id)));
        setUploadOpen(false);
    };

    return (
        <>
            <AccordionItem value={folder.id} className="border-none">
                <ContextMenu>
                    <ContextMenuTrigger>
                        <AccordionTrigger className="hover:bg-accent rounded-md px-2 py-1.5 hover:no-underline group">
                            <div className="flex items-center gap-2 flex-1">
                                <FolderIcon className="h-4 w-4 text-muted-foreground shrink-0" />
                                <EditableText
                                    value={folder.name}
                                    editing={isFolderEditing}
                                    onStartEdit={() => setEditingId(folder.id)}
                                    onSave={(name) => {
                                        renameFolder(folder.id, name);
                                        setEditingId(null);
                                    }}
                                    className="text-sm font-medium"
                                />
                            </div>
                        </AccordionTrigger>
                    </ContextMenuTrigger>
                    <ContextMenuContent>
                        <ContextMenuItem onSelect={() => setEditingId(folder.id)}>
                            Rename
                        </ContextMenuItem>
                        <ContextMenuItem onSelect={() => setUploadOpen(true)}>
                            <UploadCloud className="h-4 w-4 mr-2" />
                            Upload File
                        </ContextMenuItem>
                        <ContextMenuItem onSelect={() => router.push(`/learn/${folder.id}`)}>
                            Learn
                        </ContextMenuItem>
                        <ContextMenuSeparator />
                        <ContextMenuItem
                            onSelect={() => deleteFolder(folder.id)}
                            className="text-destructive focus:text-destructive"
                        >
                            <Trash2 className="h-4 w-4 mr-2" />
                            Delete
                        </ContextMenuItem>
                    </ContextMenuContent>
                </ContextMenu>

                <AccordionContent className="pl-4 pb-0">
                    {/* Files */}
                    {folder.files?.map((file) => (
                        <File
                            key={file.id}
                            file={file}
                            editingId={editingId}
                            parentFolder={folder}
                            onStartEdit={setEditingId}
                        />
                    ))}

                    {/* Child Folders */}
                    {folder.children?.map((child) => (
                        <Folder
                            key={child.id}
                            folder={child}
                            editingId={editingId}
                            setEditingId={setEditingId}
                        />
                    ))}
                </AccordionContent>
            </AccordionItem>

            {/* Upload Dialog */}
            <Dialog open={uploadOpen} onOpenChange={setUploadOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Upload files to {folder.name}</DialogTitle>
                    </DialogHeader>
                    <FileUpload
                        onChange={handleUpload}
                        multiple
                    />
                </DialogContent>
            </Dialog>
        </>
    );
}

// Main Folder Tree Component
export function FolderTree() {
    const { folders, loading, createFolder, createFile } = useFiles();
    const [editingId, setEditingId] = React.useState<string | null>(null);
    const [createOpen, setCreateOpen] = React.useState(false);
    const [uploadOpen, setUploadOpen] = React.useState(false);
    const [newFolderName, setNewFolderName] = React.useState("");

    const handleCreateFolder = async () => {
        if (!newFolderName.trim()) return;
        await createFolder(newFolderName, null);
        setNewFolderName("");
        setCreateOpen(false);
    };

    const handleRootUpload = async (files: File[]) => {
        if (!files.length) return;
        await Promise.all(files.map((f) => createFile(f, null)));
        setUploadOpen(false);
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center py-8 text-sm text-muted-foreground">
                Loading your sources...
            </div>
        );
    }

    return (
        <div className="space-y-2">
            {/* Action Buttons */}
            <div className="flex gap-2 px-2">
                <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCreateOpen(true)}
                    className="flex-1"
                >
                    <Plus className="h-4 w-4 mr-1" />
                    Folder
                </Button>
                <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setUploadOpen(true)}
                    className="flex-1"
                >
                    <UploadCloud className="h-4 w-4 mr-1" />
                    Upload
                </Button>
            </div>

            {/* Folder Tree */}
            {folders.length === 0 ? (
                <div className="text-center py-8 text-sm text-muted-foreground">
                    Let's create your first folder and upload some files to get started!
                </div>
            ) : (
                <Accordion type="multiple" className="space-y-1">
                    {folders.map((folder) => (
                        <Folder
                            key={folder.id}
                            folder={folder}
                            editingId={editingId}
                            setEditingId={setEditingId}
                        />
                    ))}
                </Accordion>
            )}

            {/* Create Folder Dialog */}
            <Dialog open={createOpen} onOpenChange={setCreateOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Create new folder</DialogTitle>
                    </DialogHeader>
                    <Input
                        value={newFolderName}
                        onChange={(e) => setNewFolderName(e.target.value)}
                        onKeyDown={(e) => e.key === "Enter" && handleCreateFolder()}
                        placeholder="Folder name"
                        autoFocus
                    />
                    <div className="flex justify-end gap-2">
                        <Button variant="outline" onClick={() => setCreateOpen(false)}>
                            Cancel
                        </Button>
                        <Button onClick={handleCreateFolder}>Create</Button>
                    </div>
                </DialogContent>
            </Dialog>

            {/* Upload Dialog */}
            <Dialog open={uploadOpen} onOpenChange={setUploadOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Upload files</DialogTitle>
                    </DialogHeader>
                    <FileUpload
                        onChange={handleRootUpload}
                        multiple
                    />
                </DialogContent>
            </Dialog>
        </div>
    );
}