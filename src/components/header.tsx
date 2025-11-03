"use client";

import { AppLogo } from "@/components/icons";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, FileDown, ChevronDown } from "lucide-react";
import { AdminModeToggle } from "@/components/admin/admin-mode-toggle";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface HeaderProps {
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  onExportXLSX: () => void;
  onExportPDF: () => void;
  isAdminMode: boolean;
  onAdminModeChange: (isAdmin: boolean) => void;
}

export function Header({
  searchQuery,
  setSearchQuery,
  onExportXLSX,
  onExportPDF,
  isAdminMode,
  onAdminModeChange,
}: HeaderProps) {
  return (
    <header className="sticky top-0 z-10 flex h-16 items-center gap-4 border-b bg-background/80 px-4 backdrop-blur-sm md:px-6" data-html2canvas-ignore>
      <div className="flex items-center gap-2">
        <AppLogo className="h-6 w-6 text-primary" />
        <h1 className="font-headline text-xl font-semibold text-foreground">
          EventMapper Pro
        </h1>
      </div>
      <div className="relative ml-auto flex-1 md:grow-0">
        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
        <Input
          type="search"
          placeholder="Search by ID, tag, or remark..."
          className="w-full rounded-lg bg-background pl-8 md:w-[200px] lg:w-[320px]"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" size="sm" className="hidden sm:inline-flex">
            <FileDown className="mr-2 h-4 w-4" />
            Export
            <ChevronDown className="ml-2 h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent>
          <DropdownMenuItem onClick={onExportPDF}>Export as PDF</DropdownMenuItem>
          <DropdownMenuItem onClick={onExportXLSX}>Export as XLSX</DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
      <AdminModeToggle
        isAdminMode={isAdminMode}
        onAdminModeChange={onAdminModeChange}
      />
    </header>
  );
}
