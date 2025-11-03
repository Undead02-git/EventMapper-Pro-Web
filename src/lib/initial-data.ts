import { type Floor, type Tag } from './types';
import { generateRoomPathAndLabel } from './geometry';

export const tags: Tag[] = [
  { id: 'tag-1', name: 'Conference Hall', icon: 'Building', color: '#7986CB', remark: 'Main conference and keynote area.' },
  { id: 'tag-2', name: 'Court Room', icon: 'Briefcase', color: '#9575CD', remark: 'Designated for legal team meetings.' },
  { id: 'tag-3', name: 'Exhibition Space', icon: 'LandPlot', color: '#4DB6AC', remark: 'For product showcases and demos.' },
  { id: 'tag-4', name: 'Speaker Ready Room', icon: 'Mic', color: '#F06292', remark: 'Preparation area for speakers.' },
  { id: 'tag-5', name: 'Networking Lounge', icon: 'Handshake', color: '#FFB74D', remark: 'Casual networking and coffee breaks.' },
];

const groundFloorRoomsRaw = [
    // Floor 1, North Wing (Quadrant 1)
    { id: '101', floor: 1, wing: 1, position: 'outer', order: 0, tagIds: ['tag-1'], status: 'In Use', statusRemark: 'Keynote Session' },
    { id: '102', floor: 1, wing: 1, position: 'outer', order: 1, tagIds: ['tag-2'], status: 'Available', statusRemark: '' },
    { id: '103', floor: 1, wing: 1, position: 'inner', order: 0, tagIds: ['tag-3'], status: 'Available', statusRemark: 'Setup in progress' },
    
    // Floor 1, East Wing (Quadrant 2)
    { id: '104', floor: 1, wing: 2, position: 'outer', order: 0, tagIds: ['tag-4'], status: 'In Use', statusRemark: 'Speaker: Dr. Anya Sharma' },
    { id: '105', floor: 1, wing: 2, position: 'outer', order: 1, tagIds: ['tag-2'], status: 'Maintenance', statusRemark: 'AV equipment check' },
    { id: '106', floor: 1, wing: 2, position: 'inner', order: 0, tagIds: ['tag-5'], status: 'Available', statusRemark: '' },

    // Floor 1, South Wing (Quadrant 3)
    { id: '107', floor: 1, wing: 3, position: 'outer', order: 0, tagIds: ['tag-1'], status: 'Available', statusRemark: '' },
    { id: '108', floor: 1, wing: 3, position: 'outer', order: 1, tagIds: ['tag-3'], status: 'Available', statusRemark: '' },
    { id: '109', floor: 1, wing: 3, position: 'inner', order: 0, tagIds: ['tag-5'], status: 'Available', statusRemark: '' },

    // Floor 1, West Wing (Quadrant 4)
    { id: '110', floor: 1, wing: 4, position: 'outer', order: 0, tagIds: ['tag-4'], status: 'In Use', statusRemark: 'Private Event' },
    { id: '111', floor: 1, wing: 4, position: 'outer', order: 1, tagIds: ['tag-2'], status: 'Available', statusRemark: '' },
    { id: '112', floor: 1, wing: 4, position: 'inner', order: 0, tagIds: ['tag-5'], status: 'Available', statusRemark: '' },
];

const firstFloorRoomsRaw = [
    // Floor 2, North Wing (Quadrant 1)
    { id: '201', floor: 2, wing: 1, position: 'outer', order: 0, tagIds: ['tag-2'], status: 'In Use', statusRemark: 'Team Bravo' },
    { id: '202', floor: 2, wing: 1, position: 'outer', order: 1, tagIds: ['tag-2'], status: 'Available', statusRemark: '' },
    { id: '203', floor: 2, wing: 1, position: 'inner', order: 0, tagIds: ['tag-4'], status: 'Available', statusRemark: '' },

    // Floor 2, East Wing (Quadrant 2)
    { id: '204', floor: 2, wing: 2, position: 'outer', order: 0, tagIds: ['tag-5'], status: 'In Use', statusRemark: 'VIP reception' },
    { id: '205', floor: 2, wing: 2, position: 'outer', order: 1, tagIds: ['tag-3'], status: 'Maintenance', statusRemark: 'Closed for setup' },
    { id: '206', floor: 2, wing: 2, position: 'inner', order: 0, tagIds: ['tag-2'], status: 'Available', statusRemark: '' },

    // Floor 2, South Wing (Quadrant 3)
    { id: '207', floor: 2, wing: 3, position: 'outer', order: 0, tagIds: ['tag-1'], status: 'Available', statusRemark: '' },
    { id: '208', floor: 2, wing: 3, position: 'outer', order: 1, tagIds: ['tag-3'], status: 'Available', statusRemark: '' },
    { id: '209', floor: 2, wing: 3, position: 'inner', order: 0, tagIds: ['tag-5'], status: 'Available', statusRemark: '' },

    // Floor 2, West Wing (Quadrant 4)
    { id: '210', floor: 2, wing: 4, position: 'outer', order: 0, tagIds: ['tag-4'], status: 'In Use', statusRemark: 'Private Event' },
    { id: '211', floor: 2, wing: 4, position: 'outer', order: 1, tagIds: ['tag-2'], status: 'Available', statusRemark: '' },
    { id: '212', floor: 2, wing: 4, position: 'inner', order: 0, tagIds: ['tag-5'], status: 'Available', statusRemark: '' },
];

const wings = [
  { id: 1, name: 'North Wing', path: 'M 531.8,143.9 A 450,450 0 0 1 856.1,468.2 L 676.8,482.5 A 250,250 0 0 0 517.5,323.2 Z' },
  { id: 2, name: 'East Wing', path: 'M 856.1,531.8 A 450,450 0 0 1 531.8,856.1 L 517.5,676.8 A 250,250 0 0 0 676.8,517.5 Z' },
  { id: 3, name: 'South Wing', path: 'M 468.2,856.1 A 450,450 0 0 1 143.9,531.8 L 323.2,517.5 A 250,250 0 0 0 482.5,676.8 Z' },
  { id: 4, name: 'West Wing', path: 'M 143.9,468.2 A 450,450 0 0 1 468.2,143.9 L 482.5,323.2 A 250,250 0 0 0 323.2,482.5 Z' },
];

export const floors: Floor[] = [
  {
    id: 1,
    name: 'Ground Floor',
    viewBox: '0 0 1000 1000',
    wings: wings,
    rooms: groundFloorRoomsRaw.map(r => ({ ...r, ...generateRoomPathAndLabel(r.wing, r.position as 'inner' | 'outer', r.order) })),
  },
  {
    id: 2,
    name: 'First Floor',
    viewBox: '0 0 1000 1000',
    wings: wings,
    rooms: firstFloorRoomsRaw.map(r => ({ ...r, ...generateRoomPathAndLabel(r.wing, r.position as 'inner' | 'outer', r.order) })),
  },
];
