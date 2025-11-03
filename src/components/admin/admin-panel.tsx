
"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
    Sheet,
    SheetContent,
    SheetHeader,
    SheetTitle,
    SheetDescription,
} from "@/components/ui/sheet";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { TagEditor } from "@/components/admin/tag-editor";
import { RoomEditor } from "@/components/admin/room-editor";
import { CsvImport } from "@/components/admin/csv-import";
import { Settings, Tags as TagsIcon, Building2, Upload } from "lucide-react";
import type { Tag, Floor } from "@/lib/types";

interface AdminPanelProps {
    isAdminMode: boolean;
    tags: Tag[];
    onTagsUpdate: (tags: Omit<Tag, "iconComponent">[]) => void;
    floors: Floor[];
    onFloorsUpdate: (floors: Floor[]) => void;
    currentFloor: number;
}

export function AdminPanel({ isAdminMode, tags, onTagsUpdate, floors, onFloorsUpdate, currentFloor }: AdminPanelProps) {
    const [isOpen, setIsOpen] = useState(false);

    if (!isAdminMode) return null;

    return (
        <>
            <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-20" data-html2canvas-ignore>
                <Button onClick={() => setIsOpen(true)} className="rounded-full shadow-lg">
                    <Settings className="mr-2 h-4 w-4" />
                    Admin Panel
                </Button>
            </div>
            <Sheet open={isOpen} onOpenChange={setIsOpen}>
                <SheetContent className="w-[400px] sm:w-[540px] p-0" side="left" data-html2canvas-ignore>
                    <SheetHeader className="p-6">
                        <SheetTitle>Administrator Panel</SheetTitle>
                        <SheetDescription>
                            Manage map data, tags, and settings from here.
                        </SheetDescription>
                    </SheetHeader>
                    <Tabs defaultValue="rooms" className="w-full">
                        <TabsList className="grid w-full grid-cols-3 rounded-none border-y">
                            <TabsTrigger value="rooms"><Building2 className="mr-2 h-4 w-4" />Rooms</TabsTrigger>
                            <TabsTrigger value="tags"><TagsIcon className="mr-2 h-4 w-4" />Tags</TabsTrigger>
                            <TabsTrigger value="import"><Upload className="mr-2 h-4 w-4" />Bulk Import</TabsTrigger>
                        </TabsList>
                        <TabsContent value="rooms" className="p-6">
                            <RoomEditor
                                floors={floors}
                                onFloorsUpdate={onFloorsUpdate}
                                currentFloorId={currentFloor}
                                tags={tags}
                            />
                        </TabsContent>
                        <TabsContent value="tags" className="p-6">
                            <TagEditor currentTags={tags} onTagsUpdate={onTagsUpdate} />
                        </TabsContent>
                        <TabsContent value="import" className="p-6">
                            <CsvImport
                                onTagsUpdate={onTagsUpdate}
                                onFloorsUpdate={onFloorsUpdate}
                                floors={floors}
                            />
                        </TabsContent>
                    </Tabs>
                </SheetContent>
            </Sheet>
        </>
    );
}

