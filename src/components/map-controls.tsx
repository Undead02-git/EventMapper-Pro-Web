"use client";

import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { ZoomIn, ZoomOut, Maximize } from 'lucide-react';
import { type Floor } from "@/lib/types";

interface MapControlsProps {
  floors: Floor[];
  currentFloor: number;
  onFloorChange: (floorId: number) => void;
  onZoomIn: () => void;
  onZoomOut: () => void;
  onResetZoom: () => void;
}

export function MapControls({
  floors,
  currentFloor,
  onFloorChange,
  onZoomIn,
  onZoomOut,
  onResetZoom,
}: MapControlsProps) {
  return (
    <div className="absolute top-4 left-1/2 -translate-x-1/2 z-10" data-html2canvas-ignore>
      <Tabs
        value={String(currentFloor)}
        onValueChange={(value) => onFloorChange(Number(value))}
        className="w-full"
      >
        <TabsList className="grid w-full grid-cols-2">
          {floors.map((floor) => (
            <TabsTrigger key={floor.id} value={String(floor.id)}>
              {floor.name}
            </TabsTrigger>
          ))}
        </TabsList>
      </Tabs>
    </div>
  );
}

export function ZoomControls({ onZoomIn, onZoomOut, onResetZoom }: { onZoomIn: () => void; onZoomOut: () => void; onResetZoom: () => void; }) {
  return (
    <div className="absolute bottom-4 right-4 z-10 flex flex-col gap-2" data-html2canvas-ignore>
      <Button variant="outline" size="icon" onClick={onZoomIn} aria-label="Zoom In">
        <ZoomIn className="h-4 w-4" />
      </Button>
      <Button variant="outline" size="icon" onClick={onZoomOut} aria-label="Zoom Out">
        <ZoomOut className="h-4 w-4" />
      </Button>
      <Button variant="outline" size="icon" onClick={onResetZoom} aria-label="Reset Zoom">
        <Maximize className="h-4 w-4" />
      </Button>
    </div>
  )
}
