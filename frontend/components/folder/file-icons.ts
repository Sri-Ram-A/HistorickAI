// folder/file-icons.ts
import {
  File,
  FileText,
  FileImage,
  FileCode2,
  FileVideo,
  FileAudio,
  FileArchive,
  FileType2,
  Presentation,
  Youtube,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

export interface FileMetadata {
  icon: LucideIcon;
  color: string; // tailwind text-* class
  label: string;
}

const EXT_MAP: Record<string, FileMetadata> = {
  // docs
  pdf: { icon: FileText, color: "text-red-400", label: "PDF" },
  txt: { icon: FileText, color: "text-zinc-400", label: "Text" },
  md: { icon: FileText, color: "text-blue-400", label: "Markdown" },
  doc: { icon: FileType2, color: "text-blue-500", label: "Word" },
  docx: { icon: FileType2, color: "text-blue-500", label: "Word" },
  // slides
  ppt: { icon: Presentation, color: "text-orange-400", label: "PowerPoint" },
  pptx: { icon: Presentation, color: "text-orange-400", label: "PowerPoint" },
  // images
  png: { icon: FileImage, color: "text-green-400", label: "Image" },
  jpg: { icon: FileImage, color: "text-green-400", label: "Image" },
  jpeg: { icon: FileImage, color: "text-green-400", label: "Image" },
  gif: { icon: FileImage, color: "text-green-400", label: "Image" },
  webp: { icon: FileImage, color: "text-green-400", label: "Image" },
  svg: { icon: FileImage, color: "text-purple-400", label: "SVG" },
  // code
  js: { icon: FileCode2, color: "text-yellow-400", label: "JavaScript" },
  ts: { icon: FileCode2, color: "text-blue-400", label: "TypeScript" },
  jsx: { icon: FileCode2, color: "text-cyan-400", label: "React" },
  tsx: { icon: FileCode2, color: "text-cyan-400", label: "React" },
  py: { icon: FileCode2, color: "text-yellow-300", label: "Python" },
  json: { icon: FileCode2, color: "text-amber-400", label: "JSON" },
  html: { icon: FileCode2, color: "text-orange-400", label: "HTML" },
  css: { icon: FileCode2, color: "text-blue-300", label: "CSS" },
  sql: { icon: FileCode2, color: "text-pink-400", label: "SQL" },
  // archives
  zip: { icon: FileArchive, color: "text-zinc-400", label: "ZIP" },
  rar: { icon: FileArchive, color: "text-zinc-400", label: "RAR" },
  "7z": { icon: FileArchive, color: "text-zinc-400", label: "7z" },
  tar: { icon: FileArchive, color: "text-zinc-400", label: "TAR" },
  gz: { icon: FileArchive, color: "text-zinc-400", label: "GZ" },
  // video
  mp4: { icon: FileVideo, color: "text-violet-400", label: "Video" },
  mov: { icon: FileVideo, color: "text-violet-400", label: "Video" },
  webm: { icon: FileVideo, color: "text-violet-400", label: "Video" },
  // audio
  mp3: { icon: FileAudio, color: "text-pink-400", label: "Audio" },
  wav: { icon: FileAudio, color: "text-pink-400", label: "Audio" },
  ogg: { icon: FileAudio, color: "text-pink-400", label: "Audio" },
};

export function getFileMetadata(fileUrl?: string): FileMetadata {
  if (!fileUrl) return { icon: File, color: "text-zinc-400", label: "File" };

  if (fileUrl.includes("youtube.com") || fileUrl.includes("youtu.be")) {
    return { icon: Youtube, color: "text-red-500", label: "YouTube" };
  }

  const ext = fileUrl.split(".").pop()?.toLowerCase() ?? "";
  return EXT_MAP[ext] ?? { icon: File, color: "text-zinc-400", label: ext.toUpperCase() || "File" };
}