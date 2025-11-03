
"use client";

import dynamic from 'next/dynamic';
import { Skeleton } from '@/components/ui/skeleton';

const ClientOnlyMainLayout = dynamic(
    () => import('@/components/main-layout').then(mod => mod.MainLayout),
    {
        ssr: false,
        loading: () => (
            <div className="flex h-screen w-full flex-col">
                <div className="sticky top-0 z-10 flex h-16 items-center gap-4 border-b bg-background/80 px-4 backdrop-blur-sm md:px-6">
                    <Skeleton className="h-8 w-48" />
                    <Skeleton className="h-8 w-[320px] ml-auto" />
                    <Skeleton className="h-9 w-28 hidden sm:inline-flex" />
                    <Skeleton className="h-10 w-10" />
                </div>
                <main className="flex flex-1 overflow-hidden">
                    <aside className="hidden w-72 flex-col border-r bg-background p-4 md:flex space-y-4">
                        <Skeleton className="h-8 w-32" />
                        <div className="space-y-3 flex-1">
                            <Skeleton className="h-10 w-full" />
                            <Skeleton className="h-10 w-full" />
                            <Skeleton className="h-10 w-full" />
                            <Skeleton className="h-10 w-full" />
                            <Skeleton className="h-10 w-full" />
                        </div>
                    </aside>
                    <div className="flex-1 relative">
                        <Skeleton className="h-full w-full" />
                    </div>
                </main>
            </div>
        ),
    }
);

// This component is now a simple wrapper to load the MainLayout dynamically
export function ClientOnlyMapLoader() {
    return <ClientOnlyMainLayout />;
}

