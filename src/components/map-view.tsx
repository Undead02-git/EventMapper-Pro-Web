"use client";

import React, { useState, useMemo, useRef, useEffect } from "react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { RoomDetails } from "@/components/room-details";
import { type Floor, type Room, type Tag } from "@/lib/types";
import { cn } from "@/lib/utils";

const wingColors = [
  'hsl(221 83% 53% / 0.1)',
  'hsl(142 71% 45% / 0.1)',
  'hsl(25 95% 53% / 0.1)',
  'hsl(0 84% 60% / 0.1)',
];

interface MapViewProps {
  floor: Floor;
  tags: Tag[];
  highlightedRooms: string[];
  selectedRoom: Room | null;
  onSelectRoom: (room: Room | null) => void;
  transform: { scale: number; x: number; y: number };
}

export function MapView({
  floor,
  tags,
  highlightedRooms,
  selectedRoom,
  onSelectRoom,
  transform,
}: MapViewProps) {
  const roomsById = useMemo(() => {
    const map = new Map<string, Room>();
    floor.rooms.forEach((room) => {
      map.set(room.id, room);
    });
    return map;
  }, [floor.rooms]);

  const tagsById = useMemo(() => {
    const map = new Map<string, Tag>();
    tags.forEach((tag) => {
      map.set(tag.id, tag);
    });
    return map;
  }, [tags]);

  const getRoomColor = (room: Room) => {
    if (room.status === "In Use") return "hsl(var(--destructive)/0.7)";
    if (room.status === "Maintenance") return "hsl(var(--muted-foreground)/0.7)";
    if (room.tagIds.length > 0) {
      const firstTag = tagsById.get(room.tagIds[0]);
      if (firstTag) return firstTag.color;
    }
    return "hsl(var(--primary)/0.5)";
  };

  return (
    <div
      className="relative h-full w-full overflow-hidden bg-muted/20 rounded-lg border"
      id="map-container-for-export"
    >
      <svg
        viewBox={floor.viewBox}
        className="h-full w-full"
        style={{
          transform: `translate(${transform.x}px, ${transform.y}px) scale(${transform.scale})`,
          transition: "transform 0.1s ease-out",
        }}
      >
        <g>
          {floor.wings.map((wing, index) => (
            <path
              key={`wing-${wing.id}`}
              d={wing.path}
              fill={wingColors[index % wingColors.length]}
              stroke="hsl(var(--border))"
              strokeWidth={2 / transform.scale}
            />
          ))}
        </g>
        <g>
          {/* Outer circle track */}
          <circle 
            cx="500" 
            cy="500" 
            r="420" 
            fill="none"
            stroke="hsl(var(--border))"
            strokeWidth={120 / transform.scale}
            opacity="0.5"
          />
          {/* Inner circle track */}
          <circle 
            cx="500" 
            cy="500" 
            r="290" 
            fill="hsl(var(--background))"
            stroke="hsl(var(--border))"
            strokeWidth={140 / transform.scale}
            opacity="0.5"
          />
        </g>
        <g>
          {floor.rooms.map((room) => {
            const isHighlighted = highlightedRooms.length === 0 || highlightedRooms.includes(room.id);
            const isSelected = selectedRoom?.id === room.id;

            return (
              <Popover
                key={room.id}
                open={isSelected}
                onOpenChange={(isOpen) => onSelectRoom(isOpen ? room : null)}
              >
                <PopoverTrigger asChild>
                  <g
                    className={cn(
                      "transition-opacity duration-300",
                      isHighlighted ? "opacity-100" : "opacity-20",
                      "hover:opacity-100"
                    )}
                  >
                    <path
                      d={room.path}
                      fill={getRoomColor(room)}
                      stroke={
                        isSelected ? "hsl(var(--ring))" : "hsl(var(--foreground))"
                      }
                      strokeWidth={isSelected ? 6 / transform.scale : 2 / transform.scale}
                      className="cursor-pointer transition-all"
                    />
                    <text
                      x={room.labelCoordinates.x}
                      y={room.labelCoordinates.y}
                      className="font-code text-sm font-semibold pointer-events-none select-none"
                      fill="hsl(var(--primary-foreground))"
                      textAnchor="middle"
                      dominantBaseline="middle"
                      fontSize={24 / transform.scale}
                      style={{
                        paintOrder: "stroke",
                        stroke: "hsl(var(--background))",
                        strokeWidth: 6 / transform.scale,
                        strokeLinecap: "butt",
                        strokeLinejoin: "miter",
                      }}
                    >
                      {room.id}
                    </text>
                     <text
                      x={room.labelCoordinates.x}
                      y={room.labelCoordinates.y}
                      className="font-code text-sm font-semibold pointer-events-none select-none"
                      fill="hsl(var(--foreground))"
                      textAnchor="middle"
                      dominantBaseline="middle"
                      fontSize={24 / transform.scale}
                    >
                      {room.id}
                    </text>
                  </g>
                </PopoverTrigger>
                <PopoverContent className="w-80" side="right" align="start" data-html2canvas-ignore>
                  <RoomDetails room={room} tags={tags} />
                </PopoverContent>
              </Popover>
            );
          })}
        </g>
      </svg>
    </div>
  );
}
