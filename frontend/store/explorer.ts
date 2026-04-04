"use client";

import { create } from "zustand";
import { API_PATHS, REQUEST } from "@/routes";
import type { FileT, FolderT } from "@/types";

export type FolderNode = FolderT & {
  children: FolderNode[];
  files: FileT[];
};

function buildTree(folders: FolderT[], files: FileT[]): FolderNode[] {
  const folderNodeMap = new Map<string, FolderNode>();

  for (let i = 0; i < folders.length; i++) {
    const folder = folders[i];
    const folderNode: FolderNode = {
      id: folder.id,
      name: folder.name,
      parent: folder.parent,
      path: folder.path,
      is_root: folder.is_root,
      created_at: folder.created_at,
      updated_at: folder.updated_at,
      children: [],
      files: [],
    };
    folderNodeMap.set(folder.id, folderNode);
  }

  for (let i = 0; i < files.length; i++) {
    const file = files[i];
    const parentFolderNode = folderNodeMap.get(file.folder);
    if (parentFolderNode !== undefined) {
      parentFolderNode.files.push(file);
    }
  }

  const rootFolders: FolderNode[] = [];
  const allFolderNodes = Array.from(folderNodeMap.values());

  for (let i = 0; i < allFolderNodes.length; i++) {
    const currentFolderNode = allFolderNodes[i];
    if (currentFolderNode.parent !== null && currentFolderNode.parent !== undefined) {
      const parentFolderNode = folderNodeMap.get(currentFolderNode.parent);
      if (parentFolderNode !== undefined) {
        parentFolderNode.children.push(currentFolderNode);
      }
    } else {
      rootFolders.push(currentFolderNode);
    }
  }

  return rootFolders;
}

interface ExplorerState {
  folders: FolderT[];
  files: FileT[];
  tree: FolderNode[];
  selectedFolderId: string | null;
  selectedFileId: string | null;
  previewFileId: string | null;
  loading: boolean;
  selectedFolder: () => FolderT | null;
  selectedFile: () => FileT | null;
  previewFile: () => FileT | null;
  setSelectedFolderId: (id: string | null) => void;
  setSelectedFileId: (id: string | null) => void;
  setPreviewFileId: (id: string | null) => void;
  fetch: () => Promise<void>;
  createFolder: (name: string, parentId: string | null) => Promise<void>;
  renameFolder: (id: string, name: string) => Promise<void>;
  deleteFolder: (id: string) => Promise<void>;
  uploadFile: (file: File, folderId: string) => Promise<void>;
  renameFile: (id: string, name: string) => Promise<void>;
  deleteFile: (id: string) => Promise<void>;
}

function getFolderById(folders: FolderT[], folderId: string | null): FolderT | null {
  if (folderId === null) return null;
  for (let i = 0; i < folders.length; i++) {
    if (folders[i].id === folderId) return folders[i];
  }
  return null;
}

function getFileById(files: FileT[], fileId: string | null): FileT | null {
  if (fileId === null) return null;
  for (let i = 0; i < files.length; i++) {
    if (files[i].id === fileId) return files[i];
  }
  return null;
}

function getFolderAndSubfolderIds(folders: FolderT[], rootFolderId: string): Set<string> {
  const idsToDelete = new Set<string>();
  const folderQueue = [rootFolderId];

  while (folderQueue.length > 0) {
    const currentFolderId = folderQueue.pop();
    if (currentFolderId === undefined) continue;

    idsToDelete.add(currentFolderId);

    for (let i = 0; i < folders.length; i++) {
      const folder = folders[i];
      if (folder.parent === currentFolderId) {
        folderQueue.push(folder.id);
      }
    }
  }

  return idsToDelete;
}

export const useExplorerStore = create<ExplorerState>((set, get) => ({
  folders: [],
  files: [],
  tree: [],
  selectedFolderId: null,
  selectedFileId: null,
  previewFileId: null,
  loading: false,

  selectedFolder: function () {
    return getFolderById(get().folders, get().selectedFolderId);
  },

  selectedFile: function () {
    return getFileById(get().files, get().selectedFileId);
  },

  previewFile: function () {
    return getFileById(get().files, get().previewFileId);
  },

  setSelectedFolderId: function (id) {
    set({ selectedFolderId: id });
  },

  setSelectedFileId: function (id) {
    set({ selectedFileId: id });
  },

  setPreviewFileId: function (id) {
    set({ previewFileId: id });
  },

  fetch: async function () {
    set({ loading: true });
    try {
      const result = await Promise.all([
        REQUEST("GET", API_PATHS.FOLDERS) as Promise<FolderT[]>,
        REQUEST("GET", API_PATHS.FILES) as Promise<FileT[]>,
      ]);
      const folders = result[0];
      const files = result[1];
      set({ folders: folders, files: files, tree: buildTree(folders, files) });
    } finally {
      set({ loading: false });
    }
  },

  createFolder: async function (name, parentId) {
    const createdFolder: FolderT = await REQUEST("POST", API_PATHS.FOLDERS, {
      name: name.trim(),
      parent: parentId,
    });
    set(function (state) {
      const updatedFolders = state.folders.concat(createdFolder);
      return { folders: updatedFolders, tree: buildTree(updatedFolders, state.files) };
    });
  },

  renameFolder: async function (id, name) {
    const updatedFolder: FolderT = await REQUEST("PATCH", API_PATHS.FOLDER(id), {
      name: name.trim(),
    });
    set(function (state) {
      const updatedFolders = state.folders.map(function (folder) {
        return folder.id === id ? updatedFolder : folder;
      });
      return { folders: updatedFolders, tree: buildTree(updatedFolders, state.files) };
    });
  },

  deleteFolder: async function (id) {
    await REQUEST("DELETE", API_PATHS.FOLDER(id));
    set(function (state) {
      const folderIdsToDelete = getFolderAndSubfolderIds(state.folders, id);
      const remainingFolders = state.folders.filter(function (folder) {
        return !folderIdsToDelete.has(folder.id);
      });
      const remainingFiles = state.files.filter(function (file) {
        return !folderIdsToDelete.has(file.folder);
      });
      return {
        folders: remainingFolders,
        files: remainingFiles,
        tree: buildTree(remainingFolders, remainingFiles),
        selectedFolderId: folderIdsToDelete.has(state.selectedFolderId ?? "") ? null : state.selectedFolderId,
      };
    });
  },

  uploadFile: async function (file, folderId) {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("name", file.name);
    formData.append("folder", folderId);
    const createdFile: FileT = await REQUEST("POST", API_PATHS.FILES, formData, {
      isMultipart: true,
    });
    set(function (state) {
      const updatedFiles = state.files.concat(createdFile);
      return { files: updatedFiles, tree: buildTree(state.folders, updatedFiles) };
    });
  },

  renameFile: async function (id, name) {
    const updatedFile: FileT = await REQUEST("PATCH", API_PATHS.FILE(id), {
      name: name.trim(),
    });
    set(function (state) {
      const updatedFiles = state.files.map(function (file) {
        return file.id === id ? updatedFile : file;
      });
      return { files: updatedFiles, tree: buildTree(state.folders, updatedFiles) };
    });
  },

  deleteFile: async function (id) {
    await REQUEST("DELETE", API_PATHS.FILE(id));
    set(function (state) {
      const remainingFiles = state.files.filter(function (file) {
        return file.id !== id;
      });
      return {
        files: remainingFiles,
        tree: buildTree(state.folders, remainingFiles),
        selectedFileId: state.selectedFileId === id ? null : state.selectedFileId,
        previewFileId: state.previewFileId === id ? null : state.previewFileId,
      };
    });
  },
}));