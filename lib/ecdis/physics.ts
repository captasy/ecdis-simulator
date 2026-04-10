// Ship physics simulation for ECDIS

import { Position, calculateNewPosition, normalizeAngle } from './navigation';

export type EngineOrder = 
  | 'FULL_AHEAD' 
  | 'HALF_AHEAD' 
  | 'SLOW_AHEAD' 
  | 'DEAD_SLOW_AHEAD' 
  | 'STOP' 
  | 'DEAD_SLOW_ASTERN' 
  | 'SLOW_ASTERN' 
  | 'HALF_ASTERN' 
  | 'FULL_ASTERN';

export type HelmOrder = 
  | 'HARD_PORT' 
  | 'PORT_20' 
  | 'PORT_15' 
  | 'PORT_10' 
  | 'PORT_5' 
  | 'MIDSHIPS' 
  | 'STBD_5' 
  | 'STBD_10' 
  | 'STBD_15' 
  | 'STBD_20' 
  | 'HARD_STBD';

export interface Current {
  set: number; // direction current is flowing TO (degrees)
  drift: number; // speed in knots
}

export interface ShipState {
  position: Position;
  heading: number; // ship's head, course steered (HDG)
  courseOverGround: number; // COG - actual track over ground
  speedThroughWater: number; // STW - speed relative to water
  speedOverGround: number; // SOG - actual speed over ground
  rudderAngle: number; // current rudder angle
  rateOfTurn: number; // degrees per minute
  engineOrder: EngineOrder;
  helmOrder: HelmOrder;
  depth: number; // depth under keel
}

export interface ShipCharacteristics {
  maxSpeed: number; // maximum speed in knots
  acceleration: number; // knots per second
  deceleration: number; // knots per second
  maxTurnRate: number; // maximum degrees per minute at full speed
  rudderResponseTime: number; // seconds to move rudder
  maxRudderAngle: number; // maximum rudder angle
}

// Default ship characteristics (typical cargo vessel)
export const defaultShipCharacteristics: ShipCharacteristics = {
  maxSpeed: 20,
  acceleration: 0.02,
  deceleration: 0.03,
  maxTurnRate: 30,
  rudderResponseTime: 5,
  maxRudderAngle: 35
};

// Engine order to target speed mapping
export function getTargetSpeed(order: EngineOrder, maxSpeed: number): number {
  switch (order) {
    case 'FULL_AHEAD': return maxSpeed;
    case 'HALF_AHEAD': return maxSpeed * 0.65;
    case 'SLOW_AHEAD': return maxSpeed * 0.4;
    case 'DEAD_SLOW_AHEAD': return maxSpeed * 0.2;
    case 'STOP': return 0;
    case 'DEAD_SLOW_ASTERN': return -maxSpeed * 0.15;
    case 'SLOW_ASTERN': return -maxSpeed * 0.25;
    case 'HALF_ASTERN': return -maxSpeed * 0.4;
    case 'FULL_ASTERN': return -maxSpeed * 0.5;
  }
}

// Helm order to target rudder angle mapping
export function getTargetRudderAngle(order: HelmOrder, maxRudder: number): number {
  switch (order) {
    case 'HARD_PORT': return -maxRudder;
    case 'PORT_20': return -20;
    case 'PORT_15': return -15;
    case 'PORT_10': return -10;
    case 'PORT_5': return -5;
    case 'MIDSHIPS': return 0;
    case 'STBD_5': return 5;
    case 'STBD_10': return 10;
    case 'STBD_15': return 15;
    case 'STBD_20': return 20;
    case 'HARD_STBD': return maxRudder;
  }
}

// Get display text for engine order
export function getEngineOrderText(order: EngineOrder): string {
  switch (order) {
    case 'FULL_AHEAD': return 'FULL AHEAD';
    case 'HALF_AHEAD': return 'HALF AHEAD';
    case 'SLOW_AHEAD': return 'SLOW AHEAD';
    case 'DEAD_SLOW_AHEAD': return 'D/S AHEAD';
    case 'STOP': return 'STOP';
    case 'DEAD_SLOW_ASTERN': return 'D/S ASTERN';
    case 'SLOW_ASTERN': return 'SLOW ASTERN';
    case 'HALF_ASTERN': return 'HALF ASTERN';
    case 'FULL_ASTERN': return 'FULL ASTERN';
  }
}

// Get display text for helm order
export function getHelmOrderText(order: HelmOrder): string {
  switch (order) {
    case 'HARD_PORT': return 'HARD PORT';
    case 'PORT_20': return 'PORT 20';
    case 'PORT_15': return 'PORT 15';
    case 'PORT_10': return 'PORT 10';
    case 'PORT_5': return 'PORT 5';
    case 'MIDSHIPS': return 'MIDSHIPS';
    case 'STBD_5': return 'STBD 5';
    case 'STBD_10': return 'STBD 10';
    case 'STBD_15': return 'STBD 15';
    case 'STBD_20': return 'STBD 20';
    case 'HARD_STBD': return 'HARD STBD';
  }
}

// Update ship state based on physics
export function updateShipState(
  state: ShipState,
  characteristics: ShipCharacteristics,
  current: Current,
  deltaTime: number // in seconds
): ShipState {
  const newState = { ...state };
  
  // Update speed based on engine order
  const targetSpeed = getTargetSpeed(state.engineOrder, characteristics.maxSpeed);
  const speedDiff = targetSpeed - state.speedThroughWater;
  
  if (Math.abs(speedDiff) > 0.01) {
    const acceleration = speedDiff > 0 ? characteristics.acceleration : -characteristics.deceleration;
    newState.speedThroughWater += acceleration * deltaTime;
    
    // Clamp to target
    if ((speedDiff > 0 && newState.speedThroughWater > targetSpeed) ||
        (speedDiff < 0 && newState.speedThroughWater < targetSpeed)) {
      newState.speedThroughWater = targetSpeed;
    }
  }
  
  // Update rudder angle based on helm order
  const targetRudder = getTargetRudderAngle(state.helmOrder, characteristics.maxRudderAngle);
  const rudderDiff = targetRudder - state.rudderAngle;
  const rudderRate = characteristics.maxRudderAngle / characteristics.rudderResponseTime;
  
  if (Math.abs(rudderDiff) > 0.1) {
    const rudderChange = Math.sign(rudderDiff) * Math.min(rudderRate * deltaTime, Math.abs(rudderDiff));
    newState.rudderAngle += rudderChange;
  } else {
    newState.rudderAngle = targetRudder;
  }
  
  // Calculate rate of turn based on rudder angle and speed
  // Turn rate is proportional to rudder angle and speed
  const speedFactor = Math.abs(state.speedThroughWater) / characteristics.maxSpeed;
  const rudderFactor = state.rudderAngle / characteristics.maxRudderAngle;
  newState.rateOfTurn = characteristics.maxTurnRate * rudderFactor * speedFactor;
  
  // Update heading based on rate of turn
  const headingChange = (newState.rateOfTurn / 60) * deltaTime;
  newState.heading = normalizeAngle(state.heading + headingChange);
  
  // Calculate SOG and COG based on STW, heading, and current
  // Ship's velocity through water
  const stwX = state.speedThroughWater * Math.sin(state.heading * Math.PI / 180);
  const stwY = state.speedThroughWater * Math.cos(state.heading * Math.PI / 180);
  
  // Current velocity
  const currentX = current.drift * Math.sin(current.set * Math.PI / 180);
  const currentY = current.drift * Math.cos(current.set * Math.PI / 180);
  
  // Ground velocity (ship + current)
  const sogX = stwX + currentX;
  const sogY = stwY + currentY;
  
  newState.speedOverGround = Math.sqrt(sogX * sogX + sogY * sogY);
  newState.courseOverGround = normalizeAngle(Math.atan2(sogX, sogY) * 180 / Math.PI);
  
  // Update position based on SOG and COG
  const distanceTraveled = (newState.speedOverGround / 3600) * deltaTime; // Convert knots to nm/s
  newState.position = calculateNewPosition(state.position, newState.courseOverGround, distanceTraveled);
  
  return newState;
}

// Create initial ship state
export function createInitialShipState(position: Position, heading: number = 0): ShipState {
  return {
    position,
    heading,
    courseOverGround: heading,
    speedThroughWater: 0,
    speedOverGround: 0,
    rudderAngle: 0,
    rateOfTurn: 0,
    engineOrder: 'STOP',
    helmOrder: 'MIDSHIPS',
    depth: 25
  };
}

// All engine orders in display order
export const engineOrders: EngineOrder[] = [
  'FULL_AHEAD',
  'HALF_AHEAD',
  'SLOW_AHEAD',
  'DEAD_SLOW_AHEAD',
  'STOP',
  'DEAD_SLOW_ASTERN',
  'SLOW_ASTERN',
  'HALF_ASTERN',
  'FULL_ASTERN'
];

// All helm orders in display order
export const helmOrders: HelmOrder[] = [
  'HARD_PORT',
  'PORT_20',
  'PORT_15',
  'PORT_10',
  'PORT_5',
  'MIDSHIPS',
  'STBD_5',
  'STBD_10',
  'STBD_15',
  'STBD_20',
  'HARD_STBD'
];
