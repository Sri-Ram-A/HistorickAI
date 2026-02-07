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
import { FileText, FileImage, Presentation, FileCode, File as FileIcon, FileType, ExternalLink, Folder as FolderIcon, Plus, UploadCloud, Trash2, Maximize2, Download,Video  } from "lucide-react";

import { motion, AnimatePresence } from "framer-motion";
import { useFiles } from "@/contexts/FileContext";
import { FileT, FolderT } from "@/types";
import { BASE_URL } from "@/routes";

const getFileMetadata = (fileUrl?: string) => {
    if (!fileUrl) return { url: "", type: "unknown", icon: FileIcon };
    // Clean URL construction
    const cleanBase = BASE_URL;
    const fullUrl = fileUrl.startsWith("http") ? fileUrl : `${cleanBase}${fileUrl}`;
    const ext = fileUrl.split('.').pop()?.toLowerCase();
    if (fileUrl.includes("youtube.com") || fileUrl.includes("youtu.be") || fileUrl.includes("you")) {
        return { url: fullUrl, type: "youtube", icon: Video  };
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
export function File({
    file,
    editingId,
    onStartEdit,
}: {
    file: FileT;
    editingId: string | null;
    onStartEdit: (id: string) => void;
}) {
    const [isPreviewOpen, setIsPreviewOpen] = React.useState(false);
    const { url, type, icon: Icon } = getFileMetadata(file.file);
    const isEditing = editingId === file.id;

    const renderPreviewContent = () => {
        switch (type) {
            case "image":
                return <img src={url} alt={file.name} className="max-h-[70vh] w-auto mx-auto rounded-lg shadow-2xl" />;
            case "pdf":
                return <iframe src={`${url}#toolbar=0`} className="w-full h-[70vh] rounded-lg border" />;
            case "youtube":
                const videoId = url.split("v=")[1] || url.split("/").pop();
                return (
                    <iframe
                        className="w-full aspect-video rounded-lg shadow-2xl"
                        src={`https://www.youtube.com/embed/${videoId}`}
                        allowFullScreen
                    />
                );
            default:
                return (
                    <div className="flex flex-col items-center justify-center h-[40vh] bg-accent/20 rounded-xl border-2 border-dashed">
                        <Icon className="h-16 w-16 text-muted-foreground mb-4" />
                        <p className="text-muted-foreground">Preview not available for this file type</p>
                        <Button variant="outline" className="mt-4" onClick={() => window.open(url, "_blank")}>
                            <Download className="mr-2 h-4 w-4" /> Download File
                        </Button>
                    </div>
                );
        }
    };

    return (
        <>
            <ContextMenu>
                <ContextMenuTrigger>
                    <motion.div
                        whileHover={{ x: 4 }}
                        onClick={() => setIsPreviewOpen(true)}
                        onKeyDown={(e) => {
                            if (e.key === "F2" && !isEditing) onStartEdit(file.id);
                            if (e.key === "Enter") setIsPreviewOpen(true);
                        }}
                        tabIndex={0}
                        className="flex items-center gap-3 px-3 py-2 hover:bg-accent/50 rounded-xl transition-all cursor-pointer group"
                    >
                        <Icon className="h-4 w-4 text-blue-500" />

                        <div className="flex-1 min-w-0">
                            {/* Replace with your EditableText component */}
                            <span className="text-sm font-medium truncate block">{file.name}</span>
                            <span className="text-[10px] text-muted-foreground uppercase">{type}</span>
                        </div>

                        <Maximize2 className="h-3 w-3 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                    </motion.div>
                </ContextMenuTrigger>

                <ContextMenuContent className="w-48">
                    <ContextMenuItem onSelect={() => setIsPreviewOpen(true)}>Open Preview</ContextMenuItem>
                    <ContextMenuItem onSelect={() => onStartEdit(file.id)}>Rename</ContextMenuItem>
                    <ContextMenuSeparator />
                    <ContextMenuItem className="text-destructive focus:text-destructive">
                        <Trash2 className="h-4 w-4 mr-2" /> Delete
                    </ContextMenuItem>
                </ContextMenuContent>
            </ContextMenu>

            {/* Preview Modal */}
            <Dialog open={isPreviewOpen} onOpenChange={setIsPreviewOpen}>
                <DialogContent className="max-w-4xl w-[90vw] p-0 overflow-hidden bg-black/5 backdrop-blur-xl border-white/20 shadow-2xl">
                    <AnimatePresence mode="wait">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: 20 }}
                            transition={{ duration: 0.2, ease: "easeOut" }}
                            className="flex flex-col h-full"
                        >
                            <div className="p-6">
                                <DialogHeader className="flex-row items-center justify-between space-y-0">
                                    <div className="flex items-center gap-3">
                                        <div className="p-2 bg-primary/10 rounded-lg">
                                            <Icon className="h-5 w-5 text-primary" />
                                        </div>
                                        <div>
                                            <DialogTitle className="text-lg font-semibold">{file.name}</DialogTitle>
                                            <p className="text-xs text-muted-foreground">Uploaded at {file.uploaded_at ? new Date(file.uploaded_at).toLocaleDateString() : 'N/A'}</p>
                                        </div>
                                    </div>
                                    <Button variant="ghost" size="icon" onClick={() => window.open(url, "_blank")}>
                                        <ExternalLink className="h-4 w-4" />
                                    </Button>
                                </DialogHeader>

                                <div className="mt-6 rounded-xl overflow-hidden bg-white shadow-inner">
                                    {renderPreviewContent()}
                                </div>
                            </div>
                        </motion.div>
                    </AnimatePresence>
                </DialogContent>
            </Dialog>
        </>
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