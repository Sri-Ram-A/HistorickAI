"use client";

import * as React from "react";
import { REQUEST } from "@/routes";
import { FileT, FolderT } from "@/types";

const API = {
  CREATE_FOLDER: "folder/create/folder/",
  PATCH_FOLDER: (id: string) => `folder/update/folder/${id}/`,
  DELETE_FOLDER: (id: string) => `folder/delete/folder/${id}/`,
  GET_FOLDERS: "folder/view/folders/",
  
  CREATE_FILE: "folder/create/file/",
  PATCH_FILE: (id: string) => `folder/update/file/${id}/`,
  DELETE_FILE: (id: string) => `folder/delete/file/${id}/`,
};

interface FileContextValue {
  folders: FolderT[];
  loading: boolean;
  refresh: () => Promise<void>;
  createFolder: (name: string, parentId: string | null) => Promise<void>;
  createFile: (file: File, folderId: string | null) => Promise<void>;
  renameFolder: (id: string, name: string) => Promise<void>;
  renameFile: (id: string, name: string) => Promise<void>;
  deleteFolder: (id: string) => Promise<void>;
  deleteFile: (id: string) => Promise<void>;
}

const FileContext = React.createContext<FileContextValue | undefined>(undefined);

export function FileProvider({ children }: { children: React.ReactNode }) {
  const [folders, setFolders] = React.useState<FolderT[]>([]);
  const [loading, setLoading] = React.useState(true);

  const refresh = React.useCallback(async () => {
    setLoading(true);
    try {
      const data = await REQUEST("GET", API.GET_FOLDERS);
      setFolders(data || []);
    } catch (error) {
      console.error("Failed to fetch folders:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  const createFolder = React.useCallback(
    async (name: string, parentId: string | null) => {
      await REQUEST("POST", API.CREATE_FOLDER, {
        name: name.trim(),
        parent: parentId,
      });
      await refresh();
    },
    [refresh]
  );
  React.useEffect(()=>{refresh()},[])

  const createFile = React.useCallback(
    async (file: File, folderId: string | null) => {
      const form = new FormData();
      form.append("file", file);
      form.append("name", file.name);
      form.append("folder", folderId || "");
      await REQUEST("POST", API.CREATE_FILE, form, { isMultipart: true });
      await refresh();
    },
    [refresh]
  );

  const renameFolder = React.useCallback(
    async (id: string, name: string) => {
      await REQUEST("PATCH", API.PATCH_FOLDER(id), { name });
      await refresh();
    },
    [refresh]
  );

  const renameFile = React.useCallback(
    async (id: string, name: string) => {
      await REQUEST("PATCH", API.PATCH_FILE(id), { name });
      await refresh();
    },
    [refresh]
  );

  const deleteFolder = React.useCallback(
    async (id: string) => {
      await REQUEST("DELETE", API.DELETE_FOLDER(id));
      await refresh();
    },
    [refresh]
  );

  const deleteFile = React.useCallback(
    async (id: string) => {
      await REQUEST("DELETE", API.DELETE_FILE(id));
      await refresh();
    },
    [refresh]
  );

  const value: FileContextValue = {
    folders,
    loading,
    refresh,
    createFolder,
    createFile,
    renameFolder,
    renameFile,
    deleteFolder,
    deleteFile,
  };

  return (
    <FileContext.Provider value={value}>
      {children}
    </FileContext.Provider>
  )
}

export function useFiles() {
  const context = React.useContext(FileContext);
  if (!context) { throw new Error("useFiles must be used within FileProvider"); }
  return context;
}