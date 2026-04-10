// Navigation calculations for ECDIS simulator

export interface Position {
  lat: number;
  lon: number;
}

export interface Waypoint {
  id: string;
  name: string;
  position: Position;
  speed?: number; // planned speed for this leg
  eta?: Date;
  notes?: string;
}

export interface RouteLeg {
  from: Waypoint;
  to: Waypoint;
  course: number; // true bearing
  distance: number; // nautical miles
  duration?: number; // minutes at planned speed
}

export interface Route {
  id: string;
  name: string;
  waypoints: Waypoint[];
  legs: RouteLeg[];
  totalDistance: number;
}

// Convert degrees to radians
export function toRadians(degrees: number): number {
  return degrees * (Math.PI / 180);
}

// Convert radians to degrees
export function toDegrees(radians: number): number {
  return radians * (180 / Math.PI);
}

// Calculate distance between two positions in nautical miles (Haversine formula)
export function calculateDistance(from: Position, to: Position): number {
  const R = 3440.065; // Earth's radius in nautical miles
  const dLat = toRadians(to.lat - from.lat);
  const dLon = toRadians(to.lon - from.lon);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRadians(from.lat)) * Math.cos(toRadians(to.lat)) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

// Calculate initial bearing from position A to position B (true bearing)
export function calculateBearing(from: Position, to: Position): number {
  const dLon = toRadians(to.lon - from.lon);
  const lat1 = toRadians(from.lat);
  const lat2 = toRadians(to.lat);
  
  const y = Math.sin(dLon) * Math.cos(lat2);
  const x = Math.cos(lat1) * Math.sin(lat2) - Math.sin(lat1) * Math.cos(lat2) * Math.cos(dLon);
  
  let bearing = toDegrees(Math.atan2(y, x));
  return (bearing + 360) % 360;
}

// Calculate new position given starting position, bearing, and distance
export function calculateNewPosition(start: Position, bearing: number, distance: number): Position {
  const R = 3440.065; // Earth's radius in nautical miles
  const d = distance / R;
  const brng = toRadians(bearing);
  const lat1 = toRadians(start.lat);
  const lon1 = toRadians(start.lon);
  
  const lat2 = Math.asin(
    Math.sin(lat1) * Math.cos(d) + Math.cos(lat1) * Math.sin(d) * Math.cos(brng)
  );
  const lon2 = lon1 + Math.atan2(
    Math.sin(brng) * Math.sin(d) * Math.cos(lat1),
    Math.cos(d) - Math.sin(lat1) * Math.sin(lat2)
  );
  
  return {
    lat: toDegrees(lat2),
    lon: toDegrees(lon2)
  };
}

// Calculate CPA (Closest Point of Approach) and TCPA (Time to CPA)
export function calculateCPATCPA(
  ownPosition: Position,
  ownCourse: number,
  ownSpeed: number,
  targetPosition: Position,
  targetCourse: number,
  targetSpeed: number
): { cpa: number; tcpa: number } {
  // Convert to relative motion
  const ownVx = ownSpeed * Math.sin(toRadians(ownCourse));
  const ownVy = ownSpeed * Math.cos(toRadians(ownCourse));
  const targetVx = targetSpeed * Math.sin(toRadians(targetCourse));
  const targetVy = targetSpeed * Math.cos(toRadians(targetCourse));
  
  // Relative velocity
  const relVx = targetVx - ownVx;
  const relVy = targetVy - ownVy;
  
  // Relative position (approximate for small distances)
  const latDiff = (targetPosition.lat - ownPosition.lat) * 60; // Convert to nm
  const lonDiff = (targetPosition.lon - ownPosition.lon) * 60 * Math.cos(toRadians(ownPosition.lat));
  
  const relX = lonDiff;
  const relY = latDiff;
  
  // Calculate TCPA
  const relSpeedSq = relVx * relVx + relVy * relVy;
  
  if (relSpeedSq < 0.0001) {
    // Targets moving parallel or stationary relative
    const cpa = Math.sqrt(relX * relX + relY * relY);
    return { cpa, tcpa: Infinity };
  }
  
  const tcpa = -(relX * relVx + relY * relVy) / relSpeedSq;
  
  // Calculate CPA
  const cpaX = relX + relVx * tcpa;
  const cpaY = relY + relVy * tcpa;
  const cpa = Math.sqrt(cpaX * cpaX + cpaY * cpaY);
  
  return { cpa, tcpa: tcpa * 60 }; // tcpa in minutes
}

// Format latitude for display
export function formatLatitude(lat: number): string {
  const dir = lat >= 0 ? 'N' : 'S';
  const absLat = Math.abs(lat);
  const deg = Math.floor(absLat);
  const min = (absLat - deg) * 60;
  return `${deg.toString().padStart(2, '0')}° ${min.toFixed(3).padStart(6, '0')}' ${dir}`;
}

// Format longitude for display
export function formatLongitude(lon: number): string {
  const dir = lon >= 0 ? 'E' : 'W';
  const absLon = Math.abs(lon);
  const deg = Math.floor(absLon);
  const min = (absLon - deg) * 60;
  return `${deg.toString().padStart(3, '0')}° ${min.toFixed(3).padStart(6, '0')}' ${dir}`;
}

// Format bearing for display
export function formatBearing(bearing: number): string {
  return `${bearing.toFixed(1).padStart(5, '0')}°`;
}

// Format distance for display
export function formatDistance(distance: number): string {
  if (distance < 0.1) {
    return `${(distance * 1852).toFixed(0)} m`;
  }
  return `${distance.toFixed(2)} NM`;
}

// Format speed for display
export function formatSpeed(speed: number): string {
  return `${speed.toFixed(1)} kn`;
}

// Format time for display (UTC)
export function formatUTC(date: Date): string {
  return date.toISOString().substr(11, 8) + ' UTC';
}

// Normalize angle to 0-360
export function normalizeAngle(angle: number): number {
  return ((angle % 360) + 360) % 360;
}

// Calculate cross-track distance (XTD) from a position to a route leg
export function calculateXTD(position: Position, legStart: Position, legEnd: Position): number {
  const d13 = calculateDistance(legStart, position);
  const brng13 = toRadians(calculateBearing(legStart, position));
  const brng12 = toRadians(calculateBearing(legStart, legEnd));
  
  const dXt = Math.asin(Math.sin(d13 / 3440.065) * Math.sin(brng13 - brng12)) * 3440.065;
  return Math.abs(dXt);
}

// Generate unique ID
export function generateId(): string {
  return Math.random().toString(36).substr(2, 9);
}

// Create route from waypoints
export function createRoute(name: string, waypoints: Waypoint[]): Route {
  const legs: RouteLeg[] = [];
  let totalDistance = 0;
  
  for (let i = 0; i < waypoints.length - 1; i++) {
    const from = waypoints[i];
    const to = waypoints[i + 1];
    const distance = calculateDistance(from.position, to.position);
    const course = calculateBearing(from.position, to.position);
    
    legs.push({
      from,
      to,
      course,
      distance,
      duration: to.speed ? (distance / to.speed) * 60 : undefined
    });
    
    totalDistance += distance;
  }
  
  return {
    id: generateId(),
    name,
    waypoints,
    legs,
    totalDistance
  };
}
