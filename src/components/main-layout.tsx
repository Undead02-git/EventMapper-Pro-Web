"use client";

import { useState, useMemo, useEffect } from "react";
import { Header } from "@/components/header";
import { Sidebar } from "@/components/sidebar";
import { MapView } from "@/components/map-view";
import { MapControls, ZoomControls } from "@/components/map-controls";
import { AdminPanel } from "@/components/admin/admin-panel";
import { type Floor, type Tag, type Room } from "@/lib/types";
import { Building, Briefcase, LandPlot, Mic, Handshake, LucideIcon, Star } from 'lucide-react';
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import * as XLSX from 'xlsx';
import { floors as defaultFloors, tags as defaultTags } from "@/lib/initial-data";

const iconMap: { [key: string]: LucideIcon } = {
    Building,
    Briefcase,
    LandPlot,
    Mic,
    Handshake,
    Star,
};

const hydrateTags = (tags: Tag[]) => {
    return tags.map(tag => ({
        ...tag,
        iconComponent: iconMap[tag.icon] || Star
    }));
};

export function MainLayout() {
    const [floors, setFloors] = useState<Floor[]>(defaultFloors);
    const [tags, setTags] = useState<Tag[]>(hydrateTags(defaultTags));
    const [isLoading, setIsLoading] = useState(true);
    const [isStorageAvailable, setIsStorageAvailable] = useState(true);

    const [currentFloor, setCurrentFloor] = useState(1);
    const [selectedTags, setSelectedTags] = useState<string[]>([]);
    const [searchQuery, setSearchQuery] = useState("");
    const [selectedRoom, setSelectedRoom] = useState<Room | null>(null);
    const [isAdminMode, setIsAdminMode] = useState(false);

    // Pan and Zoom state
    const [transform, setTransform] = useState({ scale: 1, x: 0, y: 0 });
    const [isDragging, setIsDragging] = useState(false);
    const [dragStart, setDragStart] = useState({ x: 0, y: 0 });

    const { toast } = useToast();

    // Load data from API on initial mount
    useEffect(() => {
        const fetchData = async () => {
            try {
                // Fetch floors
                const floorsResponse = await fetch('/api/floors');
                if (floorsResponse.ok) {
                    const floorsData = await floorsResponse.json();
                    setFloors(floorsData);
                } else {
                    console.error("Failed to fetch floors");
                    // Fall back to localStorage
                    try {
                        const storedFloors = localStorage.getItem('eventMapperFloors');
                        if (storedFloors) {
                            setFloors(JSON.parse(storedFloors));
                        }
                    } catch (error) {
                        console.error("Failed to load floors from localStorage:", error);
                    }
                    toast({
                        variant: "destructive",
                        title: "Could not load floor data",
                        description: "Falling back to default map data.",
                    });
                }

                // Fetch tags
                const tagsResponse = await fetch('/api/tags');
                if (tagsResponse.ok) {
                    const tagsData = await tagsResponse.json();
                    setTags(hydrateTags(tagsData));
                } else {
                    console.error("Failed to fetch tags");
                    // Fall back to localStorage
                    try {
                        const storedTags = localStorage.getItem('eventMapperTags');
                        if (storedTags) {
                            setTags(hydrateTags(JSON.parse(storedTags)));
                        }
                    } catch (error) {
                        console.error("Failed to load tags from localStorage:", error);
                    }
                    toast({
                        variant: "destructive",
                        title: "Could not load tag data",
                        description: "Falling back to default tag data.",
                    });
                }
            } catch (error) {
                console.error("Failed to load data from API:", error);
                // Fall back to localStorage
                try {
                    const storedFloors = localStorage.getItem('eventMapperFloors');
                    const storedTags = localStorage.getItem('eventMapperTags');
                    
                    if (storedFloors) {
                        setFloors(JSON.parse(storedFloors));
                    }
                    if (storedTags) {
                        setTags(hydrateTags(JSON.parse(storedTags)));
                    }
                } catch (localStorageError) {
                    console.error("Failed to load data from localStorage:", localStorageError);
                }
                
                toast({
                    variant: "destructive",
                    title: "Could not load saved data",
                    description: "Falling back to default map data.",
                });
            } finally {
                setIsLoading(false);
            }
        };

        fetchData();
    }, [toast]);

    const handleExportPDF = async () => {
        try {
            const { usePdfExport } = await import('@/hooks/use-pdf-export');
            const { exportToPdf } = usePdfExport();
            const floor = floors.find(f => f.id === currentFloor);
            if (floor) {
                await exportToPdf(floor, tags);
                toast({
                    title: "Export Successful!",
                    description: "Your PDF file has been downloaded.",
                });
            }
        } catch (error) {
            console.error("PDF Export failed", error);
            toast({
                variant: "destructive",
                title: "Export Failed",
                description: "Could not generate the PDF file.",
            });
        }
    };

    const handleExportXLSX = () => {
        const floor = floors.find(f => f.id === currentFloor);
        if (!floor) return;

        const roomsData = floor.rooms.map(room => ({
            'Room ID': room.id,
            'Floor ID': room.floor,
            'Wing': room.wing,
            'Position': room.position,
            'Order': room.order,
            'Status': room.status,
            'Status Remark': room.statusRemark,
            'Tag IDs': room.tagIds.join(', '),
        }));

        const tagsData = tags.map(tag => ({
            'Tag ID': tag.id,
            'Name': tag.name,
            'Icon': tag.icon,
            'Color': tag.color,
            'Remark': tag.remark,
        }));

        const roomsSheet = XLSX.utils.json_to_sheet(roomsData);
        const tagsSheet = XLSX.utils.json_to_sheet(tagsData);

        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, roomsSheet, 'Rooms');
        XLSX.utils.book_append_sheet(wb, tagsSheet, 'Tags');

        XLSX.writeFile(wb, `EventMapper-Pro-${floor.name.replace(' ', '-')}.xlsx`);

        toast({
            title: "Export Successful!",
            description: "Your XLSX file has been downloaded.",
        });
    };

    const handleFloorsUpdate = async (updatedFloors: Floor[]) => {
        try {
            setFloors(updatedFloors);
            
            // Save to API
            const response = await fetch('/api/floors', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(updatedFloors),
            });
            
            if (!response.ok) {
                throw new Error('Failed to save floors');
            }
            
            toast({
                title: "Success!",
                description: "Floor data saved successfully.",
            });
        } catch (error) {
            console.error("Failed to save floors:", error);
            toast({
                variant: "destructive",
                title: "Save Failed",
                description: "Could not save floor data.",
            });
        }
    };

    const handleTagsUpdate = async (updatedTags: Omit<Tag, 'iconComponent'>[]) => {
        try {
            const hydratedTags = hydrateTags(updatedTags as Tag[]);
            setTags(hydratedTags);
            
            // Save to API
            const response = await fetch('/api/tags', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(updatedTags),
            });
            
            if (!response.ok) {
                throw new Error('Failed to save tags');
            }
            
            toast({
                title: "Success!",
                description: "Tag data saved successfully.",
            });
        } catch (error) {
            console.error("Failed to save tags:", error);
            toast({
                variant: "destructive",
                title: "Save Failed",
                description: "Could not save tag data.",
            });
        }
    };

    const allRooms = useMemo(() => floors.flatMap((f) => f.rooms), [floors]);

    const highlightedRooms = useMemo(() => {
        const floorRooms = floors.find((f) => f.id === currentFloor)?.rooms || [];

        if (!searchQuery && selectedTags.length === 0) {
            return [];
        }

        let filteredRoomsByTag = floorRooms;
        if (selectedTags.length > 0) {
            filteredRoomsByTag = floorRooms.filter((room) =>
                room.tagIds.some((tagId) => selectedTags.includes(tagId))
            );
        }

        if (searchQuery) {
            const lowerCaseQuery = searchQuery.toLowerCase();
            const roomTags = (room: Room) => tags.filter(t => room.tagIds.includes(t.id));

            const globallySearchedRooms = allRooms.filter(
                (room) =>
                    room.id.toLowerCase().includes(lowerCaseQuery) ||
                    room.status.toLowerCase().includes(lowerCaseQuery) ||
                    (room.statusRemark || '').toLowerCase().includes(lowerCaseQuery) ||
                    roomTags(room).some(t => t.name.toLowerCase().includes(lowerCaseQuery)) ||
                    roomTags(room).some(t => (t.remark || '').toLowerCase().includes(lowerCaseQuery))
            ).map(r => r.id);

            const combinedFilteredRooms = [
                ...new Set([...filteredRoomsByTag.map(r => r.id), ...globallySearchedRooms])
            ];

            return floorRooms.filter(r => combinedFilteredRooms.includes(r.id)).map(r => r.id);
        }

        return filteredRoomsByTag.map((room) => room.id);
    }, [searchQuery, selectedTags, currentFloor, floors, tags, allRooms]);


    const handleTagToggle = (tagId: string) => {
        setSelectedTags((prev) =>
            prev.includes(tagId) ? prev.filter((t) => t !== tagId) : [...prev, tagId]
        );
    };

    const handleZoom = (direction: 'in' | 'out') => {
        setTransform(prev => {
            const scale = direction === 'in' ? prev.scale * 1.2 : prev.scale / 1.2;
            return { ...prev, scale: Math.max(0.2, Math.min(scale, 5)) };
        });
    };

    const handleResetZoom = () => setTransform({ scale: 1, x: 0, y: 0 });

    const handleMouseDown = (e: React.MouseEvent) => {
        // Prevent dragging if the user clicks on a room
        if ((e.target as SVGElement).closest('g[class*="transition-opacity"]')) return;

        e.preventDefault();
        setIsDragging(true);
        setDragStart({ x: e.clientX - transform.x, y: e.clientY - transform.y });
    };
    const handleMouseUp = () => setIsDragging(false);
    const handleMouseLeave = () => setIsDragging(false);
    const handleMouseMove = (e: React.MouseEvent) => {
        if (isDragging) {
            e.preventDefault();
            setTransform(prev => ({ ...prev, x: e.clientX - dragStart.x, y: e.clientY - dragStart.y }));
        }
    };

    // Add wheel event for zooming
    const handleWheel = (e: React.WheelEvent) => {
        e.preventDefault();
        if (e.deltaY < 0) {
            handleZoom('in');
        } else {
            handleZoom('out');
        }
    };

    const floorData = useMemo(() => floors.find((f) => f.id === currentFloor), [floors, currentFloor]);

    if (isLoading) {
        return <div className="flex h-screen w-full items-center justify-center">Loading...</div>;
    }

    if (!floorData) {
        // This can happen briefly if data is being updated.
        // A more robust solution might show a loading state here.
        return <div>Loading floor...</div>;
    }

    return (
        <div className="flex h-screen w-full flex-col bg-background">
            <Header
                searchQuery={searchQuery}
                setSearchQuery={setSearchQuery}
                onExportXLSX={handleExportXLSX}
                onExportPDF={handleExportPDF}
                isAdminMode={isAdminMode}
                onAdminModeChange={setIsAdminMode}
            />
            <main className="flex flex-1 overflow-hidden">
                <Sidebar
                    tags={tags}
                    wings={floorData.wings}
                    selectedTags={selectedTags}
                    onTagToggle={handleTagToggle}
                />
                <div
                    className={cn("flex-1 relative cursor-grab", isDragging && "cursor-grabbing")}
                    onMouseDown={handleMouseDown}
                    onMouseUp={handleMouseUp}
                    onMouseLeave={handleMouseLeave}
                    onMouseMove={handleMouseMove}
                    onWheel={handleWheel} // Attach wheel event
                >
                    <MapView
                        floor={floorData}
                        tags={tags}
                        highlightedRooms={highlightedRooms}
                        selectedRoom={selectedRoom}
                        onSelectRoom={setSelectedRoom}
                        transform={transform}
                    />
                    <MapControls
                        floors={floors}
                        currentFloor={currentFloor}
                        onFloorChange={setCurrentFloor}
                        onZoomIn={() => handleZoom('in')}
                        onZoomOut={() => handleZoom('out')}
                        onResetZoom={handleResetZoom}
                    />
                    <ZoomControls
                        onZoomIn={() => handleZoom('in')}
                        onZoomOut={() => handleZoom('out')}
                        onResetZoom={handleResetZoom}
                    />
                </div>
            </main>
            <AdminPanel
                isAdminMode={isAdminMode}
                tags={tags}
                onTagsUpdate={handleTagsUpdate}
                floors={floors}
                onFloorsUpdate={handleFloorsUpdate}
                currentFloor={currentFloor}
            />
        </div>
    );
}