"use client";

import * as React from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { API_PATHS, REQUEST } from "@/routes";
import type { FileT, FolderT } from "@/types";

const QUERY_KEYS = {
  folders: ["folders"] as const,
  files: ["files"] as const,
};

export type FolderNode = FolderT & {
  children: FolderNode[];
  files: FileT[];
};

function buildTree(folders: FolderT[], files: FileT[]): FolderNode[] {
  const map = new Map<string, FolderNode>();

  for (const folder of folders) {
    map.set(folder.id, {
      ...folder,
      children: [],
      files: [],
    });
  }

  for (const file of files) {
    const folder = map.get(file.folder);
    if (folder) folder.files.push(file);
  }

  const roots: FolderNode[] = [];
  for (const node of map.values()) {
    if (node.parent) {
      map.get(node.parent)?.children.push(node);
    } else {
      roots.push(node);
    }
  }

  return roots;
}

function upsertFolder(list: FolderT[], folder: FolderT): FolderT[] {
  const idx = list.findIndex((f) => f.id === folder.id);
  if (idx === -1) return [...list, folder];
  const next = list.slice();
  next[idx] = folder;
  return next;
}

function upsertFile(list: FileT[], file: FileT): FileT[] {
  const idx = list.findIndex((f) => f.id === file.id);
  if (idx === -1) return [...list, file];
  const next = list.slice();
  next[idx] = file;
  return next;
}

function removeFolderSubtree(
  folders: FolderT[],
  files: FileT[],
  folderId: string
): { folders: FolderT[]; files: FileT[] } {
  const doomed = new Set<string>([folderId]);
  const queue = [folderId];

  while (queue.length) {
    const current = queue.pop()!;
    for (const folder of folders) {
      if (folder.parent === current && !doomed.has(folder.id)) {
        doomed.add(folder.id);
        queue.push(folder.id);
      }
    }
  }

  return {
    folders: folders.filter((f) => !doomed.has(f.id)),
    files: files.filter((f) => !doomed.has(f.folder)),
  };
}

export function useExplorerData() {
  const foldersQuery = useQuery({
    queryKey: QUERY_KEYS.folders,
    queryFn: async () => (await REQUEST("GET", API_PATHS.FOLDERS)) as FolderT[],
  });

  const filesQuery = useQuery({
    queryKey: QUERY_KEYS.files,
    queryFn: async () => (await REQUEST("GET", API_PATHS.FILES)) as FileT[],
  });

  const folders = foldersQuery.data ?? [];
  const files = filesQuery.data ?? [];

  const tree = React.useMemo(() => buildTree(folders, files), [folders, files]);

  const refresh = React.useCallback(async () => {
    await Promise.all([foldersQuery.refetch(), filesQuery.refetch()]);
  }, [foldersQuery, filesQuery]);

  return {
    folders,
    files,
    tree,
    loading: foldersQuery.isLoading || filesQuery.isLoading,
    refreshing: foldersQuery.isFetching || filesQuery.isFetching,
    refresh,
  };
}

export function useExplorerActions() {
  const qc = useQueryClient();

  const createFolder = useMutation({
    mutationFn: async ({
      name,
      parentId,
    }: {
      name: string;
      parentId: string | null;
    }) =>
      REQUEST("POST", API_PATHS.FOLDERS, {
        name: name.trim(),
        parent: parentId,
      }),
    onSuccess: (newFolder: FolderT) => {
      qc.setQueryData<FolderT[]>(QUERY_KEYS.folders, (old = []) =>
        upsertFolder(old, newFolder)
      );
    },
  });

  const renameFolder = useMutation({
    mutationFn: async ({ id, name }: { id: string; name: string }) =>
      REQUEST("PATCH", API_PATHS.FOLDER(id), { name: name.trim() }),
    onSuccess: (updatedFolder: FolderT) => {
      qc.setQueryData<FolderT[]>(QUERY_KEYS.folders, (old = []) =>
        upsertFolder(old, updatedFolder)
      );
    },
  });

  const deleteFolder = useMutation({
    mutationFn: async (id: string) => REQUEST("DELETE", API_PATHS.FOLDER(id)),
    onSuccess: (_data, folderId) => {
      qc.setQueryData<FolderT[]>(QUERY_KEYS.folders, (old = []) =>
        removeFolderSubtree(old, [], folderId).folders
      );
      qc.setQueryData<FileT[]>(QUERY_KEYS.files, (old = []) =>
        removeFolderSubtree([], old, folderId).files
      );
    },
  });

  const createFile = useMutation({
    mutationFn: async ({
      file,
      folderId,
    }: {
      file: File;
      folderId: string;
    }) => {
      const form = new FormData();
      form.append("file", file);
      form.append("name", file.name);
      form.append("folder", folderId);
      return REQUEST("POST", API_PATHS.FILES, form, { isMultipart: true });
    },
    onSuccess: (newFile: FileT) => {
      qc.setQueryData<FileT[]>(QUERY_KEYS.files, (old = []) =>
        upsertFile(old, newFile)
      );
    },
  });

  const renameFile = useMutation({
    mutationFn: async ({ id, name }: { id: string; name: string }) =>
      REQUEST("PATCH", API_PATHS.FILE(id), { name: name.trim() }),
    onSuccess: (updatedFile: FileT) => {
      qc.setQueryData<FileT[]>(QUERY_KEYS.files, (old = []) =>
        upsertFile(old, updatedFile)
      );
    },
  });

  const deleteFile = useMutation({
    mutationFn: async (id: string) => REQUEST("DELETE", API_PATHS.FILE(id)),
    onSuccess: (_data, fileId) => {
      qc.setQueryData<FileT[]>(QUERY_KEYS.files, (old = []) =>
        old.filter((f) => f.id !== fileId)
      );
    },
  });

  return {
    createFolder: createFolder.mutateAsync,
    renameFolder: renameFolder.mutateAsync,
    deleteFolder: deleteFolder.mutateAsync,
    createFile: createFile.mutateAsync,
    renameFile: renameFile.mutateAsync,
    deleteFile: deleteFile.mutateAsync,

    creatingFolder: createFolder.isPending,
    renamingFolder: renameFolder.isPending,
    deletingFolder: deleteFolder.isPending,
    creatingFile: createFile.isPending,
    renamingFile: renameFile.isPending,
    deletingFile: deleteFile.isPending,
  };
}