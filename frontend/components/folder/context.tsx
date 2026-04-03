"use client";

import * as React from "react";
import { useExplorerData } from "./folder-queries";
import type { FileT, FolderT } from "@/types";

interface FileContextValue {
  selectedFile: FileT | null;
  selectedFolder: FolderT | null;
  selectedFileId: string | null;
  selectedFolderId: string | null;
  setSelectedFileId: (id: string | null) => void;
  setSelectedFolderId: (id: string | null) => void;
  folders: FolderT[];
  files: FileT[];
  loading: boolean;
  refreshing: boolean;
  refresh: () => Promise<void>;
}

const FileContext = React.createContext<FileContextValue | null>(null);

export function FileProvider({ children }: { children: React.ReactNode }) {
  const [selectedFileId, setSelectedFileId] = React.useState<string | null>(null);
  const [selectedFolderId, setSelectedFolderId] = React.useState<string | null>(null);

  const { folders, files, loading, refreshing, refresh } = useExplorerData();

  const selectedFile = React.useMemo(() => {
    return files.find((f) => f.id === selectedFileId) || null;
  }, [files, selectedFileId]);

  const selectedFolder = React.useMemo(() => {
    return folders.find((f) => f.id === selectedFolderId) || null;
  }, [folders, selectedFolderId]);

  const value: FileContextValue = {
    selectedFile,
    selectedFolder,
    selectedFileId,
    selectedFolderId,
    setSelectedFileId,
    setSelectedFolderId,
    folders,
    files,
    loading,
    refreshing,
    refresh,
  };

  return <FileContext.Provider value={value}>{children}</FileContext.Provider>;
}

export function useFiles() {
  const context = React.useContext(FileContext);
  if (!context) {
    throw new Error("useFiles must be used within a FileProvider");
  }
  return context;
}