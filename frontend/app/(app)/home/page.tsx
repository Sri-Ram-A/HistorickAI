"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useExplorerData, useExplorerActions } from "@/components/folder/folder-queries";

export default function Home() {
  const router = useRouter();
  const { tree, loading } = useExplorerData();
  const { createFolder } = useExplorerActions();

  const [username, setUsername] = useState("User");
  const [newFolder, setNewFolder] = useState("");

  useEffect(() => {
    const name = localStorage.getItem("username");
    if (name) setUsername(name);
  }, []);

  const handleCreate = async () => {
    if (!newFolder.trim()) return;
    await createFolder(newFolder, null);
    setNewFolder("");
  };

  return (
    <div className="min-h-screen bg-background px-6 py-8">
      
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-semibold">
          Welcome, <span className="font-mono">{username}</span>
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          Select a folder or create a new one to get started
        </p>
      </div>

      {/* Create Folder */}
      <div className="flex gap-2 mb-6">
        <input
          value={newFolder}
          onChange={(e) => setNewFolder(e.target.value)}
          placeholder="New folder name"
          className="border px-3 py-2 rounded w-64 text-sm"
        />
        <button
          onClick={handleCreate}
          className="px-4 py-2 rounded bg-primary text-white dark:text-black text-sm"
        >
          Create
        </button>
      </div>

      {/* Grid */}
      {loading ? (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {Array(6)
            .fill(0)
            .map((_, i) => (
              <div
                key={i}
                className="h-24 rounded bg-muted animate-pulse"
              />
            ))}
        </div>
      ) : tree.length === 0 ? (
        <div className="text-sm text-muted-foreground">
          No folders yet.
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {tree.map((folder) => (
            <div
              key={folder.id}
              onClick={() => router.push(`/${folder.id}`)}
              className="p-4 border rounded cursor-pointer hover:bg-accent transition"
            >
              <div className="text-sm font-medium truncate">
                {folder.name}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}