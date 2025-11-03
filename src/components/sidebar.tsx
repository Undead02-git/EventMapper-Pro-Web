"use client";

import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { TagFilter } from "@/components/tag-filter";
import { type Tag, type Wing } from "@/lib/types";
import { MapPinned } from 'lucide-react';

interface SidebarProps {
  tags: Tag[];
  wings: Wing[];
  selectedTags: string[];
  onTagToggle: (tagId: string) => void;
}

const wingColors = [
  '#3b82f6', // blue-500
  '#22c55e', // green-500
  '#f97316', // orange-500
  '#ef4444', // red-500
]

export function Sidebar({ tags, wings, selectedTags, onTagToggle }: SidebarProps) {
  return (
    <aside className="hidden w-72 flex-col border-r bg-background p-4 md:flex">
      <h2 className="mb-4 font-headline text-lg font-semibold tracking-tight">
        Quick Filters
      </h2>
      <ScrollArea className="flex-1">
        <TagFilter tags={tags} selectedTags={selectedTags} onTagToggle={onTagToggle} />
      </ScrollArea>
      <Separator className="my-4" />
      <div className="mt-auto">
        <h3 className="mb-2 font-headline text-base font-medium">Wing Legend</h3>
        <div className="space-y-2 text-sm">
          {wings.map((wing, index) => (
            <div key={wing.id} className="flex items-center gap-2">
              <div
                className="h-4 w-4 rounded-sm"
                style={{ backgroundColor: wingColors[index % wingColors.length] }}
              />
              <span className="text-muted-foreground">{wing.name}</span>
            </div>
          ))}
           <div className="flex items-center gap-2 pt-2">
             <MapPinned className="h-4 w-4 text-muted-foreground" />
             <span className="text-muted-foreground">Room ID</span>
           </div>
        </div>
      </div>
    </aside>
  );
}
