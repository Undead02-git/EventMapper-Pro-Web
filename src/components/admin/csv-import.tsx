
"use client";

import { useState } from "react";
import * as XLSX from "xlsx";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { type Tag, type Floor, type Room } from "@/lib/types";
import { generateRoomPathAndLabel } from "@/lib/geometry";

interface CsvImportProps {
    floors: Floor[];
    onFloorsUpdate: (floors: Floor[]) => void;
    onTagsUpdate: (tags: Omit<Tag, "iconComponent">[]) => void;
}

// Helper to create a case-insensitive key map
const createHeaderMap = (header: string[]) => {
    const map = new Map<string, string>();
    for (const key of header) {
        map.set(key.toLowerCase(), key);
    }
    return map;
};

export function CsvImport({ floors, onFloorsUpdate, onTagsUpdate }: CsvImportProps) {
    const [file, setFile] = useState<File | null>(null);
    const [isProcessing, setIsProcessing] = useState(false);
    const { toast } = useToast();

    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        if (event.target.files) {
            setFile(event.target.files[0]);
        }
    };

    const handleImport = async () => {
        if (!file) {
            toast({ variant: "destructive", title: "No file selected." });
            return;
        }

        setIsProcessing(true);
        const reader = new FileReader();

        reader.onload = (e) => {
            try {
                const data = e.target?.result;
                const workbook = XLSX.read(data, { type: "array" });
                const roomsSheetName = workbook.SheetNames.find(name => name.toLowerCase().includes('rooms'));
                const tagsSheetName = workbook.SheetNames.find(name => name.toLowerCase().includes('tags'));

                let newTags: Tag[] = [];

                if (tagsSheetName) {
                    const tagsSheet = workbook.Sheets[tagsSheetName];
                    const tagsJson = XLSX.utils.sheet_to_json<any>(tagsSheet);
                    const header: string[] = XLSX.utils.sheet_to_json(tagsSheet, { header: 1 })[0] as string[];
                    const headerMap = createHeaderMap(header);

                    const get = (key: string) => headerMap.get(key.toLowerCase());

                    newTags = tagsJson.map(row => ({
                        id: String(row[get('tag id')!]),
                        name: String(row[get('name')!]),
                        icon: String(row[get('icon')!]),
                        color: String(row[get('color')!]),
                        remark: String(row[get('remark')!] || ''),
                    }));
                    onTagsUpdate(newTags);
                }

                if (roomsSheetName) {
                    const roomsSheet = workbook.Sheets[roomsSheetName];
                    const roomsJson = XLSX.utils.sheet_to_json<any>(roomsSheet);
                    const header: string[] = XLSX.utils.sheet_to_json(roomsSheet, { header: 1 })[0] as string[];
                    const headerMap = createHeaderMap(header);
                    const get = (key: string) => headerMap.get(key.toLowerCase());

                    const roomsByFloor = new Map<number, Room[]>();

                    roomsJson.forEach(row => {
                        const floorIdKey = get('floor id');
                        const wingKey = get('wing');
                        const positionKey = get('position');
                        const orderKey = get('order');
                        const roomIdKey = get('room id');
                        const statusKey = get('status');
                        const statusRemarkKey = get('status remark');
                        const tagIdsKey = get('tag ids');

                        if (!floorIdKey || !wingKey || !positionKey || !orderKey || !roomIdKey) {
                            console.warn("Skipping a row due to missing required columns (Floor ID, Wing, Position, Order, Room ID).");
                            return;
                        }

                        const floorId = parseInt(String(row[floorIdKey]), 10);
                        if (isNaN(floorId)) return;

                        const wing = parseInt(String(row[wingKey]), 10);
                        const position = (row[positionKey] as 'inner' | 'outer');
                        const order = parseInt(String(row[orderKey]), 10);

                        const { path, labelCoordinates } = generateRoomPathAndLabel(
                            wing,
                            position,
                            order
                        );

                        const room: Room = {
                            id: String(row[roomIdKey]),
                            floor: floorId,
                            wing: wing,
                            position: position,
                            order: order,
                            status: (row[statusKey] || 'Available') as 'Available' | 'In Use' | 'Maintenance',
                            statusRemark: String(row[statusRemarkKey] || ''),
                            tagIds: String(row[tagIdsKey] || '').split(',').map(s => s.trim()).filter(Boolean),
                            path,
                            labelCoordinates
                        };

                        if (!roomsByFloor.has(floorId)) {
                            roomsByFloor.set(floorId, []);
                        }
                        roomsByFloor.get(floorId)!.push(room);
                    });

                    const updatedFloors = floors.map(floor => {
                        const newRoomsForFloor = roomsByFloor.get(floor.id);
                        // Only update the floor if new rooms for it were found in the import
                        if (newRoomsForFloor) {
                            return { ...floor, rooms: newRoomsForFloor };
                        }
                        return floor;
                    });
                    onFloorsUpdate(updatedFloors);
                }

                toast({
                    title: "Import Successful",
                    description: "Rooms and tags have been updated from the file.",
                });

            } catch (error) {
                console.error("Import error:", error);
                toast({
                    variant: "destructive",
                    title: "Import Failed",
                    description: "Could not parse the XLSX file. Please check the format and column headers.",
                });
            } finally {
                setIsProcessing(false);
            }
        };

        reader.onerror = () => {
            toast({ variant: "destructive", title: "Failed to read file." });
            setIsProcessing(false);
        }

        reader.readAsArrayBuffer(file);
    };

    return (
        <div className="space-y-6">
            <h3 className="font-headline text-lg font-medium">Import from XLSX</h3>
            <p className="text-sm text-muted-foreground">
                Upload an XLSX file with 'Rooms' and 'Tags' sheets to bulk update your map data.
                The file should match the format of the exported XLSX.
            </p>
            <div className="grid w-full max-w-sm items-center gap-2">
                <Label htmlFor="xlsx-file">XLSX File</Label>
                <Input id="xlsx-file" type="file" accept=".xlsx" onChange={handleFileChange} />
            </div>
            <Button onClick={handleImport} disabled={!file || isProcessing}>
                {isProcessing ? "Processing..." : "Import Data"}
            </Button>
        </div>
    );
}

