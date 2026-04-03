"use client";
// folder/use-file-shortcuts.ts

import * as React from "react";

interface ShortcutHandlers {
  onNewFolder?: () => void;   // Ctrl+Shift+N
  onUpload?: () => void;      // Ctrl+Shift+U
  onRename?: () => void;      // F2
  onDelete?: () => void;      // Delete / Backspace
  onOpen?: () => void;        // Enter
  onCollapseAll?: () => void; // Ctrl+Shift+W (like VS Code)
  enabled?: boolean;
}

export function useFileShortcuts(handlers: ShortcutHandlers) {
  const { enabled = true, ...h } = handlers;

  React.useEffect(() => {
    if (!enabled) return;

    const onKey = (e: KeyboardEvent) => {
      const el = e.target as HTMLElement;
      if (el.tagName === "INPUT" || el.tagName === "TEXTAREA" || el.isContentEditable) return;

      if (e.key === "F2") { e.preventDefault(); h.onRename?.(); }
      if (e.key === "Delete" || e.key === "Backspace") { e.preventDefault(); h.onDelete?.(); }
      if (e.key === "Enter") { e.preventDefault(); h.onOpen?.(); }
      if (e.ctrlKey && e.shiftKey && e.key === "N") { e.preventDefault(); h.onNewFolder?.(); }
      if (e.ctrlKey && e.shiftKey && e.key === "U") { e.preventDefault(); h.onUpload?.(); }
      if (e.ctrlKey && e.shiftKey && e.key === "W") { e.preventDefault(); h.onCollapseAll?.(); }
    };

    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [enabled, h.onDelete, h.onNewFolder, h.onOpen, h.onRename, h.onUpload, h.onCollapseAll]);
}