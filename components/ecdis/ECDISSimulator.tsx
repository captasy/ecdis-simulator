'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { ChartDisplay } from './ChartDisplay';
import { NavigationPanel } from './NavigationPanel';
import { ControlPanel } from './ControlPanel';
import { MenuBar } from './MenuBar';
import { EngineTelegraph } from './ship/EngineTelegraph';
import { HelmControl } from './ship/HelmControl';
import { RoutePanel } from './route/RoutePanel';
import { TargetList } from './targets/TargetList';
import { allCharts, type ChartData } from '@/lib/ecdis/charts';
import { 
  type ShipState, 
  type Current, 
  updateShipState, 
  createInitialShipState, 
  defaultShipCharacteristics,
  type EngineOrder,
  type HelmOrder
} from '@/lib/ecdis/physics';
import { type Target, updateTargets, createTrafficScenario } from '@/lib/ecdis/targets';
import { 
  type EBL, 
  type VRM, 
  type DisplaySettings, 
  type ToolMode,
  defaultDisplaySettings,
  colorSchemes
} from '@/lib/ecdis/types';
import { type Route, type Waypoint, generateId, createRoute, Position } from '@/lib/ecdis/navigation';

export function ECDISSimulator() {
  // Chart state
  const [currentChart, setCurrentChart] = useState<ChartData>(allCharts[0]);
  const [chartOffset, setChartOffset] = useState({ x: 0, y: 0 });
  const [chartScale, setChartScale] = useState(5000);
  
  // Ship state
  const [shipState, setShipState] = useState<ShipState>(() => 
    createInitialShipState(allCharts[0].center, 90)
  );
  
  // Current (water flow)
  const [current] = useState<Current>({ set: 45, drift: 1.5 });
  
  // Targets
  const [targets, setTargets] = useState<Target[]>([]);
  
  // Route planning
  const [route, setRoute] = useState<Route | null>(null);
  const [waypoints, setWaypoints] = useState<Waypoint[]>([]);
  const [isPlanning, setIsPlanning] = useState(false);
  
  // Navigation tools
  const [ebls, setEbls] = useState<EBL[]>([
    { id: 1, active: false, bearing: 0, relative: false },
    { id: 2, active: false, bearing: 90, relative: false }
  ]);
  const [vrms, setVrms] = useState<VRM[]>([
    { id: 1, active: false, range: 1 },
    { id: 2, active: false, range: 2 }
  ]);
  
  // Display settings
  const [displaySettings, setDisplaySettings] = useState<DisplaySettings>(defaultDisplaySettings);
  
  // Tool mode
  const [toolMode, setToolMode] = useState<ToolMode>('cursor');
  
  // Simulation state
  const [isRunning, setIsRunning] = useState(false);
  const [timeScale, setTimeScale] = useState(10);
  
  // Panel visibility
  const [showEnginePanel, setShowEnginePanel] = useState(true);
  const [showHelmPanel, setShowHelmPanel] = useState(true);
  const [showRoutePanel, setShowRoutePanel] = useState(false);
  const [showTargetList, setShowTargetList] = useState(false);
  
  // Selected target
  const [selectedTarget, setSelectedTarget] = useState<Target | null>(null);
  
  // Cursor position
  const [cursorPosition, setCursorPosition] = useState<Position | null>(null);
  
  // Animation frame ref
  const animationRef = useRef<number>();
  const lastTimeRef = useRef<number>(0);
  
  // Initialize targets when chart changes
  useEffect(() => {
    const newTargets = createTrafficScenario(currentChart.id, shipState.position);
    setTargets(newTargets);
  }, [currentChart.id]);
  
  // Simulation loop
  useEffect(() => {
    if (!isRunning) {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
      return;
    }
    
    const animate = (timestamp: number) => {
      if (lastTimeRef.current === 0) {
        lastTimeRef.current = timestamp;
      }
      
      const deltaTime = ((timestamp - lastTimeRef.current) / 1000) * timeScale;
      lastTimeRef.current = timestamp;
      
      // Update ship state
      setShipState(prev => 
        updateShipState(prev, defaultShipCharacteristics, current, deltaTime)
      );
      
      // Update targets
      setTargets(prev => 
        updateTargets(
          prev, 
          deltaTime, 
          shipState.position, 
          shipState.courseOverGround, 
          shipState.speedOverGround
        )
      );
      
      animationRef.current = requestAnimationFrame(animate);
    };
    
    animationRef.current = requestAnimationFrame(animate);
    
    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [isRunning, timeScale, current, shipState.position, shipState.courseOverGround, shipState.speedOverGround]);
  
  // Reset lastTimeRef when starting/stopping
  useEffect(() => {
    if (!isRunning) {
      lastTimeRef.current = 0;
    }
  }, [isRunning]);
  
  // Handle engine order change
  const handleEngineOrder = useCallback((order: EngineOrder) => {
    setShipState(prev => ({ ...prev, engineOrder: order }));
  }, []);
  
  // Handle helm order change
  const handleHelmOrder = useCallback((order: HelmOrder) => {
    setShipState(prev => ({ ...prev, helmOrder: order }));
  }, []);
  
  // Handle chart change
  const handleChartChange = useCallback((chartId: string) => {
    const chart = allCharts.find(c => c.id === chartId);
    if (chart) {
      setCurrentChart(chart);
      setShipState(createInitialShipState(chart.center, 90));
      setChartOffset({ x: 0, y: 0 });
      setRoute(null);
      setWaypoints([]);
    }
  }, []);
  
  // Handle waypoint add
  const handleAddWaypoint = useCallback((position: Position) => {
    if (!isPlanning) return;
    
    const newWaypoint: Waypoint = {
      id: generateId(),
      name: `WPT ${waypoints.length + 1}`,
      position,
      speed: 12
    };
    
    setWaypoints(prev => [...prev, newWaypoint]);
  }, [isPlanning, waypoints.length]);
  
  // Create route from waypoints
  const handleCreateRoute = useCallback(() => {
    if (waypoints.length >= 2) {
      const newRoute = createRoute('Route 1', waypoints);
      setRoute(newRoute);
      setIsPlanning(false);
    }
  }, [waypoints]);
  
  // Clear route
  const handleClearRoute = useCallback(() => {
    setRoute(null);
    setWaypoints([]);
    setIsPlanning(false);
  }, []);
  
  // Toggle EBL
  const handleToggleEBL = useCallback((id: number) => {
    setEbls(prev => prev.map(ebl => 
      ebl.id === id ? { ...ebl, active: !ebl.active } : ebl
    ));
  }, []);
  
  // Toggle VRM
  const handleToggleVRM = useCallback((id: number) => {
    setVrms(prev => prev.map(vrm => 
      vrm.id === id ? { ...vrm, active: !vrm.active } : vrm
    ));
  }, []);
  
  // Update EBL bearing
  const handleEBLBearingChange = useCallback((id: number, bearing: number) => {
    setEbls(prev => prev.map(ebl => 
      ebl.id === id ? { ...ebl, bearing } : ebl
    ));
  }, []);
  
  // Update VRM range
  const handleVRMRangeChange = useCallback((id: number, range: number) => {
    setVrms(prev => prev.map(vrm => 
      vrm.id === id ? { ...vrm, range } : vrm
    ));
  }, []);
  
  // Handle display setting change
  const handleDisplaySettingChange = useCallback((key: keyof DisplaySettings, value: unknown) => {
    setDisplaySettings(prev => ({ ...prev, [key]: value }));
  }, []);
  
  // Get current color scheme
  const colors = colorSchemes[displaySettings.colorScheme];
  
  return (
    <div 
      className="h-screen w-screen flex flex-col overflow-hidden"
      style={{ backgroundColor: colors.background }}
    >
      {/* Menu Bar */}
      <MenuBar 
        currentChart={currentChart}
        onChartChange={handleChartChange}
        displaySettings={displaySettings}
        onDisplaySettingChange={handleDisplaySettingChange}
        isRunning={isRunning}
        onToggleRunning={() => setIsRunning(prev => !prev)}
        timeScale={timeScale}
        onTimeScaleChange={setTimeScale}
        onToggleRoutePanel={() => setShowRoutePanel(prev => !prev)}
        onToggleTargetList={() => setShowTargetList(prev => !prev)}
        isPlanning={isPlanning}
        onTogglePlanning={() => setIsPlanning(prev => !prev)}
        colors={colors}
      />
      
      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left Side - Chart Display */}
        <div className="flex-1 relative">
          <ChartDisplay
            chart={currentChart}
            shipState={shipState}
            targets={targets}
            route={route}
            waypoints={waypoints}
            ebls={ebls}
            vrms={vrms}
            displaySettings={displaySettings}
            chartOffset={chartOffset}
            chartScale={chartScale}
            onChartOffsetChange={setChartOffset}
            onChartScaleChange={setChartScale}
            toolMode={toolMode}
            onAddWaypoint={handleAddWaypoint}
            isPlanning={isPlanning}
            onCursorPositionChange={setCursorPosition}
            selectedTarget={selectedTarget}
            onTargetSelect={setSelectedTarget}
            colors={colors}
            current={current}
          />
          
          {/* Engine Telegraph (bottom left) */}
          {showEnginePanel && (
            <div className="absolute bottom-4 left-4 z-10">
              <EngineTelegraph
                currentOrder={shipState.engineOrder}
                onOrderChange={handleEngineOrder}
                speedThroughWater={shipState.speedThroughWater}
                colors={colors}
              />
            </div>
          )}
          
          {/* Helm Control (bottom center-left) */}
          {showHelmPanel && (
            <div className="absolute bottom-4 left-52 z-10">
              <HelmControl
                currentOrder={shipState.helmOrder}
                rudderAngle={shipState.rudderAngle}
                onOrderChange={handleHelmOrder}
                colors={colors}
              />
            </div>
          )}
          
          {/* Route Panel (left side) */}
          {showRoutePanel && (
            <div className="absolute top-4 left-4 z-10">
              <RoutePanel
                waypoints={waypoints}
                route={route}
                isPlanning={isPlanning}
                onTogglePlanning={() => setIsPlanning(prev => !prev)}
                onCreateRoute={handleCreateRoute}
                onClearRoute={handleClearRoute}
                onWaypointsChange={setWaypoints}
                colors={colors}
              />
            </div>
          )}
          
          {/* Target List (left side below route) */}
          {showTargetList && (
            <div className="absolute top-4 left-4 z-10" style={{ marginTop: showRoutePanel ? '320px' : '0' }}>
              <TargetList
                targets={targets}
                selectedTarget={selectedTarget}
                onTargetSelect={setSelectedTarget}
                colors={colors}
              />
            </div>
          )}
          
          {/* CASY SIMULATIONS branding */}
          <div 
            className="absolute bottom-4 left-4 z-20 pointer-events-none"
            style={{ 
              left: showEnginePanel ? '420px' : '16px',
              bottom: '16px'
            }}
          >
            <span 
              className="text-sm font-semibold tracking-wide"
              style={{ 
                color: '#FFD700',
                textShadow: '1px 1px 2px rgba(0,0,0,0.8)',
                fontFamily: 'Arial, sans-serif'
              }}
            >
              CASY SIMULATIONS
            </span>
          </div>
        </div>
        
        {/* Right Side - Navigation Panel */}
        <NavigationPanel
          shipState={shipState}
          cursorPosition={cursorPosition}
          displaySettings={displaySettings}
          ebls={ebls}
          vrms={vrms}
          onToggleEBL={handleToggleEBL}
          onToggleVRM={handleToggleVRM}
          onEBLBearingChange={handleEBLBearingChange}
          onVRMRangeChange={handleVRMRangeChange}
          toolMode={toolMode}
          onToolModeChange={setToolMode}
          chartScale={chartScale}
          colors={colors}
          current={current}
        />
      </div>
      
      {/* Control Panel (Bottom) */}
      <ControlPanel
        isRunning={isRunning}
        onToggleRunning={() => setIsRunning(prev => !prev)}
        timeScale={timeScale}
        onTimeScaleChange={setTimeScale}
        showEnginePanel={showEnginePanel}
        onToggleEnginePanel={() => setShowEnginePanel(prev => !prev)}
        showHelmPanel={showHelmPanel}
        onToggleHelmPanel={() => setShowHelmPanel(prev => !prev)}
        displaySettings={displaySettings}
        onDisplaySettingChange={handleDisplaySettingChange}
        colors={colors}
      />
    </div>
  );
}
