"use client"

import * as React from "react"
import { REQUEST } from "@/routes"
import { FolderT } from "@/types"

export function useFolders() {
    const [folders, setFolders] = React.useState<FolderT[]>([])
    const [loading, setLoading] = React.useState(false)

    const fetch = React.useCallback(async () => {
        setLoading(true)
        try {
            const data = await REQUEST("GET", "view/folders/")
            setFolders(data || [])
        } finally {
            setLoading(false)
        }
    }, [])
console.log(folders)
    React.useEffect(() => { fetch() }, [fetch])
    return { folders, fetch, loading }
}