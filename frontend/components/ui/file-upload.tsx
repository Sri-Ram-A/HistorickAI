"use client";
import { cn } from "@/lib/utils";
import React, { useRef, useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { IconUpload, IconX, IconFile, IconCheck } from "@tabler/icons-react";
import { useDropzone } from "react-dropzone";

// Define file type categories with icons and colors
const FILE_CATEGORIES = {
  document: { 
    icon: IconFile, 
    color: "text-blue-500", 
    bgColor: "bg-blue-50 dark:bg-blue-900/20",
    extensions: ['.pdf', '.docx', '.txt', '.pptx', '.doc']
  },
  audio: { 
    icon: IconFile, 
    color: "text-green-500", 
    bgColor: "bg-green-50 dark:bg-green-900/20",
    extensions: ['.mp3', '.wav', '.m4a', '.flac']
  },
  video: { 
    icon: IconFile, 
    color: "text-purple-500", 
    bgColor: "bg-purple-50 dark:bg-purple-900/20",
    extensions: ['.mp4', '.mov', '.avi', '.mkv']
  },
  other: { 
    icon: IconFile, 
    color: "text-gray-500", 
    bgColor: "bg-gray-50 dark:bg-gray-900/20",
    extensions: []
  }
};

const getFileCategory = (file: File) => {
  const extension = `.${file.name.split('.').pop()?.toLowerCase()}`;
  for (const [category, config] of Object.entries(FILE_CATEGORIES)) {
    if ((config.extensions as string[]).includes(extension)) {
      return category as keyof typeof FILE_CATEGORIES;
    }
  }
  return 'other';
};

const formatFileSize = (bytes: number) => {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

const mainVariant = {
  initial: {
    x: 0,
    y: 0,
    scale: 1,
  },
  animate: {
    x: 20,
    y: -20,
    scale: 1.05,
    opacity: 0.9,
  },
  disabled: {
    scale: 1,
    opacity: 0.6,
  }
};

const secondaryVariant = {
  initial: {
    opacity: 0,
  },
  animate: {
    opacity: 1,
  },
};

const fileItemVariants = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -20 }
};

interface FileUploadProps {
  onChange?: (files: File[]) => void;
  onRemove?: (index: number) => void;
  disabled?: boolean;
  multiple?: boolean;
  maxFiles?: number;
  maxSize?: number; // in bytes
  accept?: Record<string, string[]>; // e.g., { 'image/*': ['.png', '.jpg'] }
  className?: string;
  showFileList?: boolean;
  placeholder?: string;
  dropzoneText?: string;
}

export const FileUpload = ({
  onChange,
  onRemove,
  disabled = false,
  multiple = true,
  maxFiles = 10,
  maxSize = 10 * 1024 * 1024, // 10MB default
  accept,
  className,
  showFileList = true,
  placeholder = "Upload file",
  dropzoneText = "Drag or drop your files here or click to upload"
}: FileUploadProps) => {
  const [files, setFiles] = useState<File[]>([]);
  const [errors, setErrors] = useState<string[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (newFiles: File[]) => {
    const validFiles: File[] = [];
    const newErrors: string[] = [];
    
    // Check if adding these files would exceed maxFiles
    if (files.length + newFiles.length > maxFiles) {
      newErrors.push(`Maximum ${maxFiles} files allowed`);
      return;
    }

    newFiles.forEach((file) => {
      // Check file size
      if (file.size > maxSize) {
        newErrors.push(`${file.name} exceeds maximum size of ${formatFileSize(maxSize)}`);
        return;
      }

      // Check file type if accept is specified
      if (accept) {
        const fileExtension = `.${file.name.split('.').pop()?.toLowerCase()}`;
        const mimeType = file.type;
        let isValid = false;

        for (const [mime, extensions] of Object.entries(accept)) {
          if (mimeType.match(new RegExp(mime.replace('*', '.*'))) || 
              extensions.includes(fileExtension)) {
            isValid = true;
            break;
          }
        }

        if (!isValid) {
          newErrors.push(`${file.name} has unsupported file type`);
          return;
        }
      }

      validFiles.push(file);
    });

    if (newErrors.length > 0) {
      setErrors(newErrors);
      // Clear errors after 5 seconds
      setTimeout(() => setErrors([]), 5000);
    }

    if (validFiles.length > 0) {
      const updatedFiles = [...files, ...validFiles];
      setFiles(updatedFiles);
      onChange && onChange(validFiles);
    }
  };

  const handleRemoveFile = (index: number) => {
    const newFiles = files.filter((_, i) => i !== index);
    setFiles(newFiles);
    onRemove && onRemove(index);
  };

  const handleClearAll = () => {
    setFiles([]);
    onChange && onChange([]);
  };

  const handleClick = () => {
    if (!disabled) {
      fileInputRef.current?.click();
    }
  };

  const { getRootProps, isDragActive } = useDropzone({
    multiple,
    noClick: true,
    disabled,
    maxSize,
    accept,
    onDrop: handleFileChange,
    onDropRejected: (rejectedFiles) => {
      const newErrors = rejectedFiles.map(({ file, errors }) => {
        if (errors.some(e => e.code === 'file-too-large')) {
          return `${file.name} is too large (max: ${formatFileSize(maxSize)})`;
        }
        if (errors.some(e => e.code === 'file-invalid-type')) {
          return `${file.name} has unsupported file type`;
        }
        return `${file.name} couldn't be uploaded`;
      });
      setErrors(newErrors);
      setTimeout(() => setErrors([]), 5000);
    },
    onDragEnter: () => setIsDragging(true),
    onDragLeave: () => setIsDragging(false),
    onDropAccepted: () => setIsDragging(false),
  });

  useEffect(() => {
    if (disabled) {
      setIsDragging(false);
    }
  }, [disabled]);

  return (
    <div className={cn("w-full", className)} {...getRootProps()}>
      <motion.div
        onClick={handleClick}
        whileHover={disabled ? "disabled" : "animate"}
        animate={isDragging && !disabled ? "animate" : "initial"}
        variants={mainVariant}
        transition={{
          type: "spring",
          stiffness: 300,
          damping: 20,
        }}
        className={cn(
          "group/file relative block w-full cursor-pointer overflow-hidden rounded-lg border-2 border-dashed p-6 transition-all",
          disabled 
            ? "cursor-not-allowed border-gray-300 bg-gray-100 dark:border-gray-700 dark:bg-gray-900/50"
            : "border-gray-300 bg-gray-50 hover:border-blue-400 hover:bg-blue-50 dark:border-gray-700 dark:bg-gray-900 dark:hover:border-blue-500 dark:hover:bg-blue-900/20",
          isDragging && !disabled && "border-blue-500 bg-blue-50 dark:border-blue-500 dark:bg-blue-900/20"
        )}
      >
        <input
          ref={fileInputRef}
          id="file-upload-handle"
          type="file"
          multiple={multiple}
          onChange={(e) => handleFileChange(Array.from(e.target.files || []))}
          className="hidden"
          disabled={disabled}
          accept={accept ? Object.entries(accept).map(([mime, exts]) => exts.join(',')).join(',') : undefined}
        />
        
        {!disabled && (
          <div className="absolute inset-0 mask-[radial-gradient(ellipse_at_center,white,transparent)]">
            <GridPattern />
          </div>
        )}

        <div className="relative z-10 flex flex-col items-center justify-center">
          <div className="mb-4 flex flex-col items-center text-center">
            <div className={cn(
              "mb-3 flex h-16 w-16 items-center justify-center rounded-full",
              disabled 
                ? "bg-gray-200 dark:bg-gray-800"
                : "bg-white shadow-lg group-hover/file:shadow-xl dark:bg-gray-800",
              isDragging && !disabled && "bg-blue-100 dark:bg-blue-900/30"
            )}>
              <IconUpload className={cn(
                "h-8 w-8 transition-colors",
                disabled 
                  ? "text-gray-400 dark:text-gray-600"
                  : "text-gray-600 group-hover/file:text-blue-600 dark:text-gray-400 dark:group-hover/file:text-blue-400",
                isDragging && !disabled && "text-blue-600 dark:text-blue-400"
              )} />
            </div>
            
            <p className={cn(
              "mb-1 font-sans text-lg font-semibold",
              disabled ? "text-gray-500 dark:text-gray-500" : "text-gray-800 dark:text-gray-200"
            )}>
              {placeholder}
            </p>
            
            <p className={cn(
              "font-sans text-sm",
              disabled ? "text-gray-400 dark:text-gray-600" : "text-gray-600 dark:text-gray-400"
            )}>
              {dropzoneText}
            </p>
            
            {maxFiles > 1 && (
              <p className="mt-1 text-xs text-gray-500 dark:text-gray-500">
                {files.length}/{maxFiles} files • Max size: {formatFileSize(maxSize)}
              </p>
            )}
          </div>

          <AnimatePresence>
            {errors.length > 0 && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="mb-4 w-full max-w-xl"
              >
                {errors.map((error, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20 }}
                    className="mb-2 rounded-lg bg-red-50 p-3 text-sm text-red-600 dark:bg-red-900/20 dark:text-red-400"
                  >
                    {error}
                  </motion.div>
                ))}
              </motion.div>
            )}
          </AnimatePresence>

          {showFileList && files.length > 0 && (
            <div className="relative w-full max-w-xl">
              <div className="mb-2 flex items-center justify-between">
                <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Selected files ({files.length})
                </h4>
                {files.length > 0 && !disabled && (
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleClearAll();
                    }}
                    className="text-xs text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300"
                  >
                    Clear all
                  </button>
                )}
              </div>
              
              <AnimatePresence>
                <div className="space-y-2">
                  {files.map((file, idx) => {
                    const category = getFileCategory(file);
                    const CategoryIcon = FILE_CATEGORIES[category].icon;
                    
                    return (
                      <motion.div
                        key={`file-${idx}-${file.lastModified}`}
                        layout
                        variants={fileItemVariants}
                        initial="initial"
                        animate="animate"
                        exit="exit"
                        transition={{ duration: 0.2 }}
                        className={cn(
                          "relative flex items-center gap-3 rounded-lg border p-3",
                          disabled 
                            ? "border-gray-200 bg-gray-50 dark:border-gray-800 dark:bg-gray-900/50"
                            : "border-gray-200 bg-white dark:border-gray-800 dark:bg-gray-900",
                          "hover:shadow-sm"
                        )}
                      >
                        <div className={cn(
                          "flex h-10 w-10 shrink-0 items-center justify-center rounded-md",
                          FILE_CATEGORIES[category].bgColor
                        )}>
                          <CategoryIcon className={cn("h-5 w-5", FILE_CATEGORIES[category].color)} />
                        </div>
                        
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-2">
                            <p className="truncate text-sm font-medium text-gray-900 dark:text-gray-100">
                              {file.name}
                            </p>
                            {!disabled && (
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleRemoveFile(idx);
                                }}
                                className="shrink-0 rounded-full p-1 hover:bg-gray-100 dark:hover:bg-gray-800"
                                aria-label={`Remove ${file.name}`}
                              >
                                <IconX className="h-4 w-4 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300" />
                              </button>
                            )}
                          </div>
                          
                          <div className="mt-1 flex flex-wrap items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
                            <span className="rounded-full bg-gray-100 px-2 py-0.5 dark:bg-gray-800">
                              {category.charAt(0).toUpperCase() + category.slice(1)}
                            </span>
                            <span>{formatFileSize(file.size)}</span>
                            <span>•</span>
                            <span className="truncate">{file.type || "Unknown type"}</span>
                          </div>
                        </div>
                      </motion.div>
                    );
                  })}
                </div>
              </AnimatePresence>
            </div>
          )}

          {!files.length && !isDragActive && (
            <motion.div
              variants={secondaryVariant}
              className="absolute inset-0 z-0 flex items-center justify-center rounded-md opacity-0"
            >
              <div className="h-32 w-32 rounded-lg border-2 border-dashed border-blue-300 bg-blue-50/50 dark:border-blue-700 dark:bg-blue-900/10" />
            </motion.div>
          )}

          {isDragActive && !disabled && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="absolute inset-0 z-20 flex items-center justify-center rounded-lg bg-blue-50/90 dark:bg-blue-900/30"
            >
              <div className="text-center">
                <div className="mb-2 inline-flex h-12 w-12 items-center justify-center rounded-full bg-blue-100 dark:bg-blue-800">
                  <IconUpload className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                </div>
                <p className="text-sm font-medium text-blue-700 dark:text-blue-300">
                  Drop files here
                </p>
              </div>
            </motion.div>
          )}
        </div>
      </motion.div>
    </div>
  );
};

export function GridPattern() {
  const columns = 41;
  const rows = 11;
  return (
    <div className="flex shrink-0 scale-105 flex-wrap items-center justify-center gap-x-px gap-y-px bg-gray-100 dark:bg-neutral-900">
      {Array.from({ length: rows }).map((_, row) =>
        Array.from({ length: columns }).map((_, col) => {
          const index = row * columns + col;
          return (
            <div
              key={`${col}-${row}`}
              className={cn(
                "flex h-10 w-10 shrink-0 rounded-[2px] transition-colors",
                index % 2 === 0
                  ? "bg-gray-50 dark:bg-neutral-950"
                  : "bg-gray-50 shadow-[0px_0px_1px_3px_rgba(255,255,255,1)_inset] dark:bg-neutral-950 dark:shadow-[0px_0px_1px_3px_rgba(0,0,0,1)_inset]",
                "group-hover/file:bg-blue-50 dark:group-hover/file:bg-blue-950/20"
              )}
            />
          );
        }),
      )}
    </div>
  );
}