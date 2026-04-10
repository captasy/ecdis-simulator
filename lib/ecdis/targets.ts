// Target simulation for ECDIS

import { Position, calculateNewPosition, calculateCPATCPA, normalizeAngle } from './navigation';

export interface Target {
  id: string;
  name: string;
  mmsi?: string;
  position: Position;
  course: number;
  speed: number;
  heading?: number;
  type: 'vessel' | 'ais' | 'arpa';
  cpa?: number;
  tcpa?: number;
  dangerous?: boolean;
}

// Generate random targets for a chart area
export function generateTargets(
  bounds: { north: number; south: number; east: number; west: number },
  count: number = 5
): Target[] {
  const targets: Target[] = [];
  
  for (let i = 0; i < count; i++) {
    const lat = bounds.south + Math.random() * (bounds.north - bounds.south);
    const lon = bounds.west + Math.random() * (bounds.east - bounds.west);
    const course = Math.random() * 360;
    const speed = 5 + Math.random() * 15;
    
    targets.push({
      id: `TGT-${i + 1}`,
      name: `VESSEL ${String.fromCharCode(65 + i)}`,
      mmsi: `${200000000 + Math.floor(Math.random() * 99999999)}`,
      position: { lat, lon },
      course,
      speed,
      heading: course + (Math.random() - 0.5) * 5, // slight heading variation
      type: Math.random() > 0.3 ? 'ais' : 'arpa'
    });
  }
  
  return targets;
}

// Update target positions
export function updateTargets(
  targets: Target[],
  deltaTime: number, // in seconds
  ownPosition: Position,
  ownCourse: number,
  ownSpeed: number
): Target[] {
  return targets.map(target => {
    // Calculate distance traveled
    const distance = (target.speed / 3600) * deltaTime;
    
    // Update position
    const newPosition = calculateNewPosition(target.position, target.course, distance);
    
    // Calculate CPA/TCPA
    const { cpa, tcpa } = calculateCPATCPA(
      ownPosition,
      ownCourse,
      ownSpeed,
      newPosition,
      target.course,
      target.speed
    );
    
    // Mark as dangerous if CPA < 0.5nm and TCPA > 0 and TCPA < 15 min
    const dangerous = cpa < 0.5 && tcpa > 0 && tcpa < 15;
    
    return {
      ...target,
      position: newPosition,
      cpa,
      tcpa,
      dangerous
    };
  });
}

// Add slight course variation to make targets more realistic
export function applyTargetVariation(target: Target): Target {
  // Random course variation (simulating helmsmanship)
  const courseVariation = (Math.random() - 0.5) * 2;
  // Random speed variation
  const speedVariation = (Math.random() - 0.5) * 0.2;
  
  return {
    ...target,
    course: normalizeAngle(target.course + courseVariation),
    speed: Math.max(0, target.speed + speedVariation)
  };
}

// Calculate vector endpoint for target display
export function calculateVectorEndpoint(
  position: Position,
  course: number,
  speed: number,
  vectorMinutes: number
): Position {
  const distance = (speed / 60) * vectorMinutes; // nm traveled in vectorMinutes
  return calculateNewPosition(position, course, distance);
}

// Format target info for display
export function formatTargetInfo(target: Target): string[] {
  const lines = [
    target.name,
    `MMSI: ${target.mmsi || 'N/A'}`,
    `COG: ${target.course.toFixed(1)}°`,
    `SOG: ${target.speed.toFixed(1)} kn`,
    `CPA: ${target.cpa?.toFixed(2) || 'N/A'} nm`,
    `TCPA: ${target.tcpa ? (target.tcpa > 0 ? target.tcpa.toFixed(1) + ' min' : 'PASSED') : 'N/A'}`
  ];
  return lines;
}

// Create predefined traffic scenarios
export function createTrafficScenario(
  chartId: string,
  ownPosition: Position
): Target[] {
  switch (chartId) {
    case 'singapore':
      return [
        {
          id: 'TGT-1',
          name: 'EVER GIVEN',
          mmsi: '353136000',
          position: { lat: ownPosition.lat + 0.02, lon: ownPosition.lon + 0.05 },
          course: 270,
          speed: 12,
          type: 'ais'
        },
        {
          id: 'TGT-2',
          name: 'MAERSK LINE',
          mmsi: '220417000',
          position: { lat: ownPosition.lat - 0.015, lon: ownPosition.lon + 0.03 },
          course: 85,
          speed: 14,
          type: 'ais'
        },
        {
          id: 'TGT-3',
          name: 'COSCO SHIP',
          mmsi: '413000000',
          position: { lat: ownPosition.lat + 0.01, lon: ownPosition.lon - 0.04 },
          course: 90,
          speed: 11,
          type: 'ais'
        },
        {
          id: 'TGT-4',
          name: 'TARGET 04',
          position: { lat: ownPosition.lat - 0.03, lon: ownPosition.lon - 0.02 },
          course: 45,
          speed: 8,
          type: 'arpa'
        },
        {
          id: 'TGT-5',
          name: 'VLCC TANKER',
          mmsi: '538006000',
          position: { lat: ownPosition.lat + 0.025, lon: ownPosition.lon - 0.06 },
          course: 100,
          speed: 10,
          type: 'ais'
        }
      ];
    default:
      return generateTargets(
        {
          north: ownPosition.lat + 0.1,
          south: ownPosition.lat - 0.1,
          east: ownPosition.lon + 0.15,
          west: ownPosition.lon - 0.15
        },
        5
      );
  }
}
