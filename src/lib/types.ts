import type { LucideIcon } from 'lucide-react';

export interface Tag {
  id: string;
  name: string;
  icon: string; // Could be initials or lucide-react icon name
  iconComponent?: LucideIcon;
  color: string; // hex color
  remark: string;
}

export interface Room {
  id: string; // Static Room ID e.g., "101"
  path: string; // SVG path data for the room shape
  labelCoordinates: { x: number; y: number };
  wing: number;
  floor: number;
  position: 'inner' | 'outer';
  order: number;
  tagIds: string[]; // array of tag IDs
  status: 'Available' | 'In Use' | 'Maintenance';
  statusRemark: string;
}

export interface Wing {
  id: number;
  name: string;
  path: string; // SVG path data for the wing shape
}

export interface Floor {
  id: number;
  name: string;
  viewBox: string;
  wings: Wing[];
  rooms: Room[];
}
