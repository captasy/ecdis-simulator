// Type definitions for ECDIS simulator

import type { ChartData } from './charts';
import type { ShipState, Current } from './physics';
import type { Target } from './targets';
import type { Route, Waypoint, Position } from './navigation';

export interface EBL {
  id: number;
  active: boolean;
  bearing: number; // degrees
  relative: boolean; // true = relative to heading, false = true bearing
}

export interface VRM {
  id: number;
  active: boolean;
  range: number; // nautical miles
}

export interface CursorInfo {
  position: Position;
  bearing: number;
  distance: number;
}

export interface DisplaySettings {
  colorScheme: 'day' | 'dusk' | 'night';
  showDepthContours: boolean;
  showSoundings: boolean;
  showNavAids: boolean;
  showTSS: boolean;
  showRangeRings: boolean;
  showHeadingLine: boolean;
  showCOGVector: boolean;
  rangeRingInterval: number; // nm
  vectorLength: number; // minutes
  depthShading: boolean;
  safetyContour: number; // meters
  shallowContour: number; // meters
  deepContour: number; // meters
}

export interface SimulatorState {
  chart: ChartData;
  ship: ShipState;
  current: Current;
  targets: Target[];
  route: Route | null;
  activeWaypoint: number;
  ebls: EBL[];
  vrms: VRM[];
  cursorInfo: CursorInfo | null;
  displaySettings: DisplaySettings;
  chartOffset: { x: number; y: number };
  chartScale: number; // pixels per degree
  isRunning: boolean;
  timeScale: number; // simulation speed multiplier
}

export interface ChartTransform {
  offset: { x: number; y: number };
  scale: number;
}

export type ToolMode = 
  | 'cursor' 
  | 'ebl1' 
  | 'ebl2' 
  | 'vrm1' 
  | 'vrm2' 
  | 'waypoint' 
  | 'measure'
  | 'info';

export interface MenuState {
  activeMenu: string | null;
  subMenu: string | null;
}

export const defaultDisplaySettings: DisplaySettings = {
  colorScheme: 'day',
  showDepthContours: true,
  showSoundings: true,
  showNavAids: true,
  showTSS: true,
  showRangeRings: true,
  showHeadingLine: true,
  showCOGVector: true,
  rangeRingInterval: 1,
  vectorLength: 6,
  depthShading: true,
  safetyContour: 15,
  shallowContour: 10,
  deepContour: 30
};

// Color schemes matching JRC ECDIS
export const colorSchemes = {
  day: {
    background: '#e8e4d4',
    land: '#f5f0dc',
    landOutline: '#8b8878',
    shallowWater: '#aee1f5',
    mediumWater: '#7cc8eb',
    deepWater: '#5eb3de',
    safeWater: '#d4f0fc',
    unsafeWater: '#ff9999',
    depthContour5: '#87ceeb',
    depthContour10: '#6cb4d8',
    depthContour20: '#5099c5',
    depthContour30: '#357fb2',
    depthContour50: '#1a649f',
    sounding: '#333333',
    navAidGreen: '#00aa00',
    navAidRed: '#dd0000',
    navAidYellow: '#ddaa00',
    lighthouse: '#ffcc00',
    tssLane: 'rgba(255, 0, 255, 0.15)',
    tssSeparation: 'rgba(255, 0, 255, 0.3)',
    route: '#ff00ff',
    waypoint: '#ff00ff',
    ownShip: '#000000',
    ownShipOutline: '#ffff00',
    target: '#00ff00',
    targetDangerous: '#ff0000',
    ebl: '#00ffff',
    vrm: '#00ffff',
    cursor: '#ffffff',
    rangeRing: 'rgba(128, 128, 128, 0.5)',
    headingLine: '#ff0000',
    cogVector: '#00ff00',
    text: '#000000'
  },
  dusk: {
    background: '#2d2d3d',
    land: '#3d3d4d',
    landOutline: '#5d5d6d',
    shallowWater: '#1a3a4d',
    mediumWater: '#153045',
    deepWater: '#10253d',
    safeWater: '#1f4a5d',
    unsafeWater: '#5d2020',
    depthContour5: '#2a5a6d',
    depthContour10: '#254f62',
    depthContour20: '#204457',
    depthContour30: '#1b394c',
    depthContour50: '#162e41',
    sounding: '#aaaaaa',
    navAidGreen: '#00cc00',
    navAidRed: '#ff4444',
    navAidYellow: '#ffcc00',
    lighthouse: '#ffdd44',
    tssLane: 'rgba(200, 100, 200, 0.2)',
    tssSeparation: 'rgba(200, 100, 200, 0.4)',
    route: '#ff66ff',
    waypoint: '#ff66ff',
    ownShip: '#ffffff',
    ownShipOutline: '#ffff00',
    target: '#44ff44',
    targetDangerous: '#ff4444',
    ebl: '#44ffff',
    vrm: '#44ffff',
    cursor: '#ffffff',
    rangeRing: 'rgba(160, 160, 160, 0.4)',
    headingLine: '#ff6666',
    cogVector: '#44ff44',
    text: '#cccccc'
  },
  night: {
    background: '#0a0a12',
    land: '#1a1a22',
    landOutline: '#333340',
    shallowWater: '#0a1520',
    mediumWater: '#08101a',
    deepWater: '#050a12',
    safeWater: '#0d1f2a',
    unsafeWater: '#2a0a0a',
    depthContour5: '#152535',
    depthContour10: '#12202d',
    depthContour20: '#0f1a25',
    depthContour30: '#0c151d',
    depthContour50: '#091015',
    sounding: '#666666',
    navAidGreen: '#00aa00',
    navAidRed: '#cc3333',
    navAidYellow: '#ccaa00',
    lighthouse: '#ddbb33',
    tssLane: 'rgba(150, 75, 150, 0.2)',
    tssSeparation: 'rgba(150, 75, 150, 0.35)',
    route: '#cc44cc',
    waypoint: '#cc44cc',
    ownShip: '#cccccc',
    ownShipOutline: '#cccc00',
    target: '#33cc33',
    targetDangerous: '#cc3333',
    ebl: '#33cccc',
    vrm: '#33cccc',
    cursor: '#aaaaaa',
    rangeRing: 'rgba(100, 100, 100, 0.3)',
    headingLine: '#cc4444',
    cogVector: '#33cc33',
    text: '#888888'
  }
};

export type ColorScheme = typeof colorSchemes.day;
