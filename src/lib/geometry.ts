
const CENTER_X = 500;
const CENTER_Y = 500;
const OUTER_RADIUS = 360;
const INNER_RADIUS = 220;
const ROOM_SIZE = 40;

// Helper to convert degrees to radians
const toRadians = (degrees: number) => degrees * (Math.PI / 180);

/**
 * Generates the SVG `d` attribute for a room's path, placing it along a circular arc.
 * @param wing The wing number (1-4).
 * @param position 'inner' or 'outer' circle.
 * @param order The sequential order of the room in the wing/position.
 * @returns An object containing the SVG path string and the label coordinates.
 */
export const generateRoomPathAndLabel = (wing: number, position: 'inner' | 'outer', order: number) => {
    // Add validation to prevent errors from NaN or undefined values.
    const validWing = typeof wing === 'number' && !isNaN(wing) ? wing : 1;
    const validOrder = typeof order === 'number' && !isNaN(order) ? order : 0;
    const validPosition = position || 'outer';

    const radius = validPosition === 'inner' ? INNER_RADIUS : OUTER_RADIUS;
    
    // Each wing is 90 degrees. We offset by -45 to center the wings in the quadrants.
    const wingStartAngle = (validWing - 1) * 90 - 45;
    
    // Distribute rooms within the wing's 90-degree arc.
    const anglePerRoom = 90 / 8; // Allow more rooms per wing section
    const angleOffset = anglePerRoom / 2;
    const roomCenterAngle = wingStartAngle + (validOrder * anglePerRoom) + angleOffset;

    // Calculate coordinates for the 4 corners of the room
    const halfSize = ROOM_SIZE / 2;
    const corners = [-halfSize, halfSize].flatMap(dx => 
        [-halfSize, halfSize].map(dy => {
            const angle = toRadians(roomCenterAngle);
            const x = CENTER_X + (radius + dy) * Math.cos(angle) - dx * Math.sin(angle);
            const y = CENTER_Y + (radius + dy) * Math.sin(angle) + dx * Math.cos(angle);
            return { x, y };
        })
    );

    const path = `M ${corners[0].x} ${corners[0].y} L ${corners[1].x} ${corners[1].y} L ${corners[3].x} ${corners[3].y} L ${corners[2].x} ${corners[2].y} Z`;

    // Calculate label coordinates at the center of the room's arc
    const labelAngle = toRadians(roomCenterAngle);
    const labelCoordinates = {
        x: CENTER_X + radius * Math.cos(labelAngle),
        y: CENTER_Y + radius * Math.sin(labelAngle),
    };

    return { path, labelCoordinates };
};
