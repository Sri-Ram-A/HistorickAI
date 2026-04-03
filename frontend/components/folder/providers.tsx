// components/folder/providers.tsx

"use client";

import * as React from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { FileProvider } from "./context";

export function Providers({ children }: { children: React.ReactNode }) {
    const [queryClient] = React.useState(
        () =>
            new QueryClient({
                defaultOptions: {
                    queries: {
                        staleTime: 30_000,
                        refetchOnWindowFocus: false,
                        retry: 1,
                    },
                },
            })
    );

    return (
    <QueryClientProvider client={queryClient}>
        <FileProvider>
            {children}
        </FileProvider>
    </QueryClientProvider>
    );
}