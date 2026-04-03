"use client";

import * as React from "react";
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

import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";

import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { getFileMetadata } from "@/components/folder/file-icons";
import type { FileT } from "@/types";
import {
  useExplorerActions,
  useExplorerData,
  type FolderNode,
} from "@/components/folder/folder-queries";
import { useFiles } from "@/components/folder/context";

function InlineRename({
  defaultValue,
  onSave,
  onCancel,
}: {
  defaultValue: string;
  onSave: (v: string) => void | Promise<void>;
  onCancel: () => void;
}) {
  const [value, setValue] = React.useState(defaultValue);
  const ref = React.useRef<HTMLInputElement | null>(null);

  React.useEffect(() => {
    ref.current?.select();
  }, []);

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
        if (e.key === "Enter") {
          e.preventDefault();
          commit();
        }
        if (e.key === "Escape") {
          e.preventDefault();
          onCancel();
        }
      }}
      onClick={(e) => e.stopPropagation()}
      className="h-6 px-1.5 py-0 text-xs focus-visible:ring-1"
    />
  );
}

function FileRow({
  file,
  onSelectFile,
  onRename,
  onDelete,
}: {
  file: FileT;
  onSelectFile: (id: string) => void;
  onRename: (name: string) => Promise<void>;
  onDelete: () => Promise<void>;
}) {
  const [renaming, setRenaming] = React.useState(false);
  const { icon: Icon, color } = getFileMetadata(file.file ?? undefined);

  return (
    <SidebarMenuSubItem>
      <SidebarMenuSubButton
        className="group/file gap-2"
        onClick={() => onSelectFile(file.id)}
      >
        <Icon className={cn("h-3.5 w-3.5 shrink-0", color)} />
        {renaming ? (
          <InlineRename
            defaultValue={file.name}
            onSave={async (name) => {
              await onRename(name);
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
              className="opacity-0 transition-opacity group-hover/file:opacity-100"
              showOnHover
            >
              <MoreHorizontal className="h-3.5 w-3.5" />
            </SidebarMenuAction>
          </DropdownMenuTrigger>
          <DropdownMenuContent side="right" align="start" className="w-40 text-xs">
            <DropdownMenuItem onClick={() => setRenaming(true)}>
              Rename
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={onDelete}
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

function FolderRow({
  folder,
  activeId,
  onSelectFolder,
  onSelectFile,
  onCreateChild,
  onRenameFolder,
  onDeleteFolder,
  onRenameFile,
  onDeleteFile,
  onUploadFolder,
}: {
  folder: FolderNode;
  activeId: string | null;
  onSelectFolder: (id: string) => void;
  onSelectFile: (id: string) => void;
  onCreateChild: (parentId: string, name: string) => Promise<void>;
  onRenameFolder: (id: string, name: string) => Promise<void>;
  onDeleteFolder: (id: string) => Promise<void>;
  onRenameFile: (id: string, name: string) => Promise<void>;
  onDeleteFile: (id: string) => Promise<void>;
  onUploadFolder: (folderId: string) => void;
}) {
  const [open, setOpen] = React.useState(false);
  const [renaming, setRenaming] = React.useState(false);
  const [newChild, setNewChild] = React.useState(false);

  const hasChildren = folder.children.length > 0 || folder.files.length > 0;
  const active = activeId === folder.id;

  return (
    <SidebarMenuItem>
      <SidebarMenuButton
        isActive={active}
        onClick={() => {
          onSelectFolder(folder.id);
          if (hasChildren) setOpen((v) => !v);
        }}
        onDoubleClick={() => setRenaming(true)}
        tooltip={folder.path || folder.name}
        className="group/folder gap-1.5"
      >
        <ChevronRight
          className={cn(
            "h-3.5 w-3.5 shrink-0 text-muted-foreground transition-transform",
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
              await onRenameFolder(folder.id, name);
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
              className="opacity-0 transition-opacity group-hover/folder:opacity-100"
              showOnHover
            >
              <MoreHorizontal className="h-3.5 w-3.5" />
            </SidebarMenuAction>
          </DropdownMenuTrigger>
          <DropdownMenuContent side="right" align="start" className="w-44 text-xs">
            <DropdownMenuItem
              onClick={() => {
                setNewChild(true);
                setOpen(true);
              }}
            >
              <FolderPlus className="mr-2 h-3.5 w-3.5" />
              New folder
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => onUploadFolder(folder.id)}>
              <Upload className="mr-2 h-3.5 w-3.5" />
              Upload file
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => setRenaming(true)}>
              Rename
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={async () => {
                if (!confirm(`Delete "${folder.name}" and its contents?`)) return;
                await onDeleteFolder(folder.id);
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
          {newChild && (
            <SidebarMenuSubItem>
              <div className="flex items-center gap-1.5 px-2 py-0.5">
                <FolderIcon className="h-3.5 w-3.5 shrink-0 text-amber-400" />
                <InlineRename
                  defaultValue=""
                  onSave={async (name) => {
                    await onCreateChild(folder.id, name);
                    setNewChild(false);
                  }}
                  onCancel={() => setNewChild(false)}
                />
              </div>
            </SidebarMenuSubItem>
          )}

          {folder.children.map((child) => (
            <FolderRow
              key={child.id}
              folder={child}
              activeId={activeId}
              onSelectFolder={onSelectFolder}
              onCreateChild={onCreateChild}
              onRenameFolder={onRenameFolder}
              onDeleteFolder={onDeleteFolder}
              onRenameFile={onRenameFile}
              onDeleteFile={onDeleteFile}
              onUploadFolder={onUploadFolder}
            />
          ))}

          {folder.files.map((file) => (
            <FileRow
              key={file.id}
              file={file}
              onSelectFile={onSelectFile}
              onRename={async (name) => onRenameFile(file.id, name)}
              onDelete={async () => onDeleteFile(file.id)}
            />
          ))}
        </SidebarMenuSub>
      )}
    </SidebarMenuItem>
  );
}

export function FileSidebar() {
  const { tree, loading, refresh } = useExplorerData();
  const {
    createFolder,
    createFile,
    renameFolder,
    deleteFolder,
    renameFile,
    deleteFile,
  } = useExplorerActions();
  const { selectedFolderId, setSelectedFolderId, setSelectedFileId } = useFiles();

  const [creatingRoot, setCreatingRoot] = React.useState(false);
  const [uploadTarget, setUploadTarget] = React.useState<string | null>(null);

  const uploadInputRef = React.useRef<HTMLInputElement | null>(null);

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const list = e.target.files;
    if (!list || !uploadTarget) return;

    try {
      await Promise.all(Array.from(list).map((file) => createFile({ file, folderId: uploadTarget })));
      toast.success(`${list.length} file(s) uploaded`);
    } catch {
      toast.error("Upload failed");
    } finally {
      e.target.value = "";
      setUploadTarget(null);
    }
  };

  const createRoot = async (name: string) => {
    try {
      await createFolder({ name, parentId: null });
      toast.success("Folder created");
    } catch {
      toast.error("Failed to create folder");
    } finally {
      setCreatingRoot(false);
    }
  };

  return (
    <Sidebar collapsible="icon" className="border-r border-border/50">
      <SidebarHeader className="border-b border-border/50 px-3 py-2">
        <div className="flex items-center justify-between">
          <span className="select-none text-xs font-semibold uppercase tracking-widest text-muted-foreground">
            Explorer
          </span>

          <div className="flex items-center gap-0.5">
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

            <Tooltip>
              <TooltipTrigger asChild>
                <button
                  onClick={refresh}
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

      <SidebarContent>
        <SidebarGroup className="py-1">
          <SidebarGroupContent>
            <SidebarMenu>
              {creatingRoot && (
                <SidebarMenuItem>
                  <div className="flex items-center gap-1.5 px-2 py-0.5">
                    <FolderIcon className="h-4 w-4 shrink-0 text-amber-400" />
                    <InlineRename
                      defaultValue=""
                      onSave={createRoot}
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
                  <FolderRow
                    key={folder.id}
                    folder={folder}
                    activeId={selectedFolderId}
                    onSelectFolder={setSelectedFolderId}
                    onSelectFile={setSelectedFileId}
                    onCreateChild={async (parentId, name) => {
                      try {
                        await createFolder({ name, parentId });
                        toast.success("Folder created");
                      } catch {
                        toast.error("Failed to create folder");
                      }
                    }}
                    onRenameFolder={async (id, name) => {
                      try {
                        await renameFolder({ id, name });
                        toast.success("Folder renamed");
                      } catch {
                        toast.error("Failed to rename folder");
                      }
                    }}
                    onDeleteFolder={async (id) => {
                      try {
                        await deleteFolder(id);
                        if (selectedFolderId === id) setSelectedFolderId(null);
                        toast.success("Folder deleted");
                      } catch {
                        toast.error("Failed to delete folder");
                      }
                    }}
                    onRenameFile={async (id, name) => {
                      try {
                        await renameFile({ id, name });
                        toast.success("File renamed");
                      } catch {
                        toast.error("Failed to rename file");
                      }
                    }}
                    onDeleteFile={async (id) => {
                      try {
                        await deleteFile(id);
                        toast.success("File deleted");
                      } catch {
                        toast.error("Failed to delete file");
                      }
                    }}
                    onUploadFolder={(folderId) => {
                      setUploadTarget(folderId);
                      uploadInputRef.current?.click();
                    }}
                  />
                ))
              )}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <input
        ref={uploadInputRef}
        type="file"
        multiple
        className="hidden"
        onChange={handleUpload}
      />
    </Sidebar>
  );
}