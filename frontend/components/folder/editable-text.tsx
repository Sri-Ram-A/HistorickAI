"use client";

import * as React from "react";
import { Input } from "@/components/ui/input";

interface EditableTextProps {
    value: string;
    editing: boolean;
    onStartEdit: () => void;
    onSave: (value: string) => void;
    className?: string;
}

export function EditableText({
    value,
    editing,
    onStartEdit,
    onSave,
    className = "",
}: EditableTextProps) {
    const [local, setLocal] = React.useState(value);

    React.useEffect(() => {
        setLocal(value);
    }, [value]);

    const commit = () => {
        const trimmed = local.trim();
        if (trimmed && trimmed !== value) {
            onSave(trimmed);
        } else {
            setLocal(value);
        }
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
                onClick={(e) => e.stopPropagation()}
            />
        );
    }

    return (
        <span
            title={value}
            onDoubleClick={onStartEdit}
            className={`flex-1 truncate ${className}`}
        >
            {value}
        </span>
    );
}