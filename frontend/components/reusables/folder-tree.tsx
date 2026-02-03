"use client";

import * as React from "react";
import { Accordion, AccordionItem, AccordionTrigger, AccordionContent } from "@/components/ui/accordion";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { ContextMenu, ContextMenuTrigger, ContextMenuContent, ContextMenuItem } from "@/components/ui/context-menu";
import { File as FileIcon, Folder as FolderIcon, MoreHorizontal, UploadCloud, Plus } from "lucide-react";
import { FileUpload } from "@/components/ui/file-upload";
import { REQUEST } from "@/routes";
import { FileT, FolderT } from "@/types";
import { useFolders } from "@/hooks/use-folders";
import { useRouter } from "next/navigation";

const API = {
  CREATE_FILE: "create/files/",
  CREATE_FOLDER: "create/folder/",
  PATCH_FOLDER: (id: string) => `folders/${id}/`,
  PATCH_FILE: (id: string) => `files/${id}/`,
};

/* -------------------- EditableText --------------------
   Very small component: toggles between text and Input.
   - title attribute on the span shows full name on hover (native tooltip)
   - onSave is called with a new name
*/
function EditableText({
  value,
  editing,
  onStartEdit,
  onSave,
  className = "",
}: {
  value: string;
  editing: boolean;
  onStartEdit: () => void;
  onSave: (v: string) => void;
  className?: string;
}) {
  const [local, setLocal] = React.useState(value);

  // if value changed from parent, keep local in sync
  React.useEffect(() => setLocal(value), [value]);

  const commit = () => {
    const trimmed = local.trim();
    if (trimmed && trimmed !== value) onSave(trimmed);
    else setLocal(value); // reset if empty or unchanged
  };

  if (editing) {
    return (
      <Input
        autoFocus
        value={local}
        onChange={(e) => setLocal(e.target.value)}
        onBlur={commit}
        onKeyDown={(e) => {
          if (e.key === "Enter") commit();
          if (e.key === "Escape") setLocal(value);
        }}
        className={`h-7 text-sm ${className}`}
      />
    );
  }

  return (
    <span title={value} onDoubleClick={onStartEdit} className={`cursor-text ${className}`}>
      {value}
    </span>
  );
}

/* -------------------- FileItem --------------------
   Renders a single file row. Supports:
    - double-click to rename
    - F2 (when focused) to rename
    - context menu with Rename
*/
function FileItem({
  file,
  editingId,
  onStartEdit,
  onRename,
}: {
  file: FileT;
  editingId: string | null;
  onStartEdit: (id: string) => void;
  onRename: (id: string, name: string) => void;
}) {
  const isEditing = editingId === file.id;

  return (
    <div
      key={file.id}
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === "F2" && !isEditing) onStartEdit(file.id);
      }}
      className="flex items-center gap-2 px-2 py-1 hover:bg-muted/20 rounded transition-colors"
      onDoubleClick={() => onStartEdit(file.id)}
    >
      <FileIcon className="h-4 w-4 text-muted-foreground shrink-0" />
      <div className="flex-1 flex items-center">
        <ContextMenu>
          <ContextMenuTrigger asChild>
            <div className="flex-1">
              <EditableText
                value={file.name}
                editing={isEditing}
                onStartEdit={() => onStartEdit(file.id)}
                onSave={(name) => onRename(file.id, name)}
                className="text-sm truncate"
              />
            </div>
          </ContextMenuTrigger>

          <ContextMenuContent>
            <ContextMenuItem onSelect={() => onStartEdit(file.id)}>
              Rename
            </ContextMenuItem>
          </ContextMenuContent>
        </ContextMenu>
      </div>
    </div>
  );
}

/* -------------------- FolderNode --------------------
   Recursive: renders a folder row, its files, and child folders.
   - inline rename for folder (double-click, F2, Enter/Escape/blur)
   - Learn context menu item uses next/router push to /learn/<id>
   - Upload dialog (uses FileUpload)
*/
function FolderNode({
  folder,
  editingId,
  setEditingId,
  onSaveRename,
  refresh,
}: {
  folder: FolderT;
  editingId: string | null;
  setEditingId: (id: string | null) => void;
  onSaveRename: (id: string, type: "folder" | "file", name: string) => Promise<void>;
  refresh: () => void;
}) {
  const [uploadOpen, setUploadOpen] = React.useState(false);
  const router = useRouter();

  const isFolderEditing = editingId === folder.id;

  const startEditFolder = () => setEditingId(folder.id);
  const startEditFile = (id: string) => setEditingId(id);

  const saveFolder = async (name: string) => {
    await onSaveRename(folder.id, "folder", name);
    setEditingId(null);
  };

  const saveFile = async (id: string, name: string) => {
    await onSaveRename(id, "file", name);
    setEditingId(null);
  };

  return (
    <div tabIndex={0} className="outline-none">
      <AccordionItem value={folder.id}>
        <AccordionTrigger className="flex items-center justify-between px-2 py-1 hover:bg-muted/30 rounded-md group">
          <div className="flex items-center gap-2 flex-1">
            <FolderIcon className="h-4 w-4 text-sky-500 shrink-0" />
            <ContextMenu>
              <ContextMenuTrigger asChild>
                <div className="flex-1">
                  <EditableText
                    value={folder.name}
                    editing={isFolderEditing}
                    onStartEdit={startEditFolder}
                    onSave={saveFolder}
                    className="text-sm truncate"
                  />
                </div>
              </ContextMenuTrigger>

              <ContextMenuContent>
                <ContextMenuItem onSelect={startEditFolder}>Rename</ContextMenuItem>
                <ContextMenuItem onSelect={() => setUploadOpen(true)}>Upload File</ContextMenuItem>
                <ContextMenuItem onSelect={() => router.push(`/learn/${folder.id}`)}>Learn</ContextMenuItem>
              </ContextMenuContent>
            </ContextMenu>
          </div>

          {/* kebab menu on the right (keeps the header compact) */}
          <ContextMenu>
            <ContextMenuTrigger asChild>
              <button
                onClick={(e) => e.stopPropagation()}
                className="p-1 rounded hover:bg-muted opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <MoreHorizontal className="h-4 w-4" />
              </button>
            </ContextMenuTrigger>
            <ContextMenuContent>
              <ContextMenuItem onSelect={startEditFolder}>Rename</ContextMenuItem>
              <ContextMenuItem onSelect={() => setUploadOpen(true)}>Upload File</ContextMenuItem>
              <ContextMenuItem onSelect={() => router.push(`/learn/${folder.id}`)}>Learn</ContextMenuItem>
            </ContextMenuContent>
          </ContextMenu>
        </AccordionTrigger>

        <AccordionContent className="pl-6 space-y-1">
          {/* files */}
          {folder.files?.map((file) => (
            <FileItem
              key={file.id}
              file={file}
              editingId={editingId}
              onStartEdit={(id) => startEditFile(id)}
              onRename={saveFile}
            />
          ))}

          {/* children */}
          {folder.children?.map((child) => (
            <FolderNode
              key={child.id}
              folder={child}
              editingId={editingId}
              setEditingId={setEditingId}
              onSaveRename={onSaveRename}
              refresh={refresh}
            />
          ))}
        </AccordionContent>
      </AccordionItem>

      <Dialog open={uploadOpen} onOpenChange={setUploadOpen}>
        <DialogContent className="max-w-xl">
          <FileUpload
            onChange={async (files) => {
              if (!files.length) return;
              await Promise.all(
                files.map(async (f) => {
                  const form = new FormData();
                  form.append("file", f);
                  form.append("name", f.name);
                  form.append("folder", folder.id);
                  await REQUEST("POST", API.CREATE_FILE, form, { isMultipart: true });
                })
              );
              setUploadOpen(false);
              refresh();
            }}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
}

/* -------------------- Root header dialogs -------------------- */
function CreateFolderDialog({
  open,
  onOpenChange,
  parentId,
  onCreated,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  parentId: string | null;
  onCreated: () => void;
}) {
  const [name, setName] = React.useState("");
  const [loading, setLoading] = React.useState(false);

  const create = async () => {
    if (!name.trim()) return;
    setLoading(true);
    try {
      await REQUEST("POST", API.CREATE_FOLDER, { name: name.trim(), parent: parentId ?? null });
      setName("");
      onOpenChange(false);
      onCreated();
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-sm">
        <div className="space-y-4">
          <p className="text-sm text-muted-foreground">Create folder</p>
          <Input value={name} onChange={(e) => setName(e.target.value)} onKeyDown={(e) => e.key === "Enter" && create()} placeholder="Folder name" />
          <div className="flex justify-end gap-2">
            <button onClick={() => onOpenChange(false)} className="px-3 py-1 rounded hover:bg-muted">Cancel</button>
            <button onClick={create} disabled={loading || !name.trim()} className="px-3 py-1 rounded bg-primary text-primary-foreground disabled:opacity-50">
              {loading ? "Creating..." : "Create"}
            </button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

/* -------------------- FolderTree (root) -------------------- */
export function FolderTree() {
  const { folders, fetch, loading } = useFolders();
  const [editingId, setEditingId] = React.useState<string | null>(null);
  const [createOpen, setCreateOpen] = React.useState(false);
  const [uploadOpen, setUploadOpen] = React.useState(false);

  const saveRename = React.useCallback(
    async (id: string, type: "folder" | "file", name: string) => {
      const path = type === "folder" ? API.PATCH_FOLDER(id) : API.PATCH_FILE(id);
      await REQUEST("PATCH", path, { name });
      setEditingId(null);
      fetch();
    },
    [fetch]
  );

  return (
    <div className="rounded-lg border bg-background/50 shadow-sm overflow-hidden flex flex-col h-full">
      <div className="flex items-center justify-between px-2 py-2 border-b">
        <span className="text-sm font-semibold text-muted-foreground">/</span>
        <ContextMenu>
          <ContextMenuTrigger asChild>
            <button className="p-1 rounded hover:bg-muted">
              <MoreHorizontal className="h-4 w-4" />
            </button>
          </ContextMenuTrigger>
          <ContextMenuContent>
            <ContextMenuItem onSelect={() => setCreateOpen(true)}>
              <Plus className="mr-2 h-4 w-4" /> Create Folder
            </ContextMenuItem>
            <ContextMenuItem onSelect={() => setUploadOpen(true)}>
              <UploadCloud className="mr-2 h-4 w-4" /> Upload File
            </ContextMenuItem>
          </ContextMenuContent>
        </ContextMenu>
      </div>

      <div className="flex-1 overflow-auto">
        <Accordion type="multiple" className="space-y-0">
          {loading && <div className="px-4 py-8 text-center text-sm text-muted-foreground">Loading folders...</div>}

          {folders.map((folder) => (
            <FolderNode
              key={folder.id}
              folder={folder}
              editingId={editingId}
              setEditingId={setEditingId}
              onSaveRename={saveRename}
              refresh={fetch}
            />
          ))}

          {!loading && folders.length === 0 && <div className="px-4 py-8 text-center text-sm text-muted-foreground">No folders yet</div>}
        </Accordion>
      </div>

      <CreateFolderDialog open={createOpen} onOpenChange={setCreateOpen} parentId={null} onCreated={fetch} />

      <Dialog open={uploadOpen} onOpenChange={setUploadOpen}>
        <DialogContent className="max-w-xl">
          <FileUpload
            onChange={async (files) => {
              if (!files.length) return;
              await Promise.all(
                files.map(async (f) => {
                  const form = new FormData();
                  form.append("file", f);
                  form.append("name", f.name);
                  form.append("folder", "");
                  await REQUEST("POST", API.CREATE_FILE, form, { isMultipart: true });
                })
              );
              setUploadOpen(false);
              fetch();
            }}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default FolderTree;
