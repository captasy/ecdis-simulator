'use client';

import { useEffect, useRef, useCallback, useState } from 'react';
import type { ChartData } from '@/lib/ecdis/charts';
import type { ShipState, Current } from '@/lib/ecdis/physics';
import type { Target } from '@/lib/ecdis/targets';
import type { Route, Waypoint, Position } from '@/lib/ecdis/navigation';
import type { EBL, VRM, DisplaySettings, ToolMode, ColorScheme } from '@/lib/ecdis/types';
import { 
  calculateDistance, 
  calculateBearing, 
  formatLatitude, 
  formatLongitude,
  formatBearing,
  formatDistance
} from '@/lib/ecdis/navigation';
import { calculateVectorEndpoint } from '@/lib/ecdis/targets';

interface ChartDisplayProps {
  chart: ChartData;
  shipState: ShipState;
  targets: Target[];
  route: Route | null;
  waypoints: Waypoint[];
  ebls: EBL[];
  vrms: VRM[];
  displaySettings: DisplaySettings;
  chartOffset: { x: number; y: number };
  chartScale: number;
  onChartOffsetChange: (offset: { x: number; y: number }) => void;
  onChartScaleChange: (scale: number) => void;
  toolMode: ToolMode;
  onAddWaypoint: (position: Position) => void;
  isPlanning: boolean;
  onCursorPositionChange: (position: Position | null) => void;
  selectedTarget: Target | null;
  onTargetSelect: (target: Target | null) => void;
  colors: ColorScheme;
  current: Current;
}

export function ChartDisplay({
  chart,
  shipState,
  targets,
  route,
  waypoints,
  ebls,
  vrms,
  displaySettings,
  chartOffset,
  chartScale,
  onChartOffsetChange,
  onChartScaleChange,
  toolMode,
  onAddWaypoint,
  isPlanning,
  onCursorPositionChange,
  selectedTarget,
  onTargetSelect,
  colors,
  current
}: ChartDisplayProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [canvasSize, setCanvasSize] = useState({ width: 800, height: 600 });
  const [mousePos, setMousePos] = useState<{ x: number; y: number } | null>(null);
  
  // Convert lat/lon to canvas coordinates
  const latLonToCanvas = useCallback((lat: number, lon: number): { x: number; y: number } => {
    const centerX = canvasSize.width / 2;
    const centerY = canvasSize.height / 2;
    
    const x = centerX + (lon - shipState.position.lon) * chartScale + chartOffset.x;
    const y = centerY - (lat - shipState.position.lat) * chartScale + chartOffset.y;
    
    return { x, y };
  }, [canvasSize, shipState.position, chartScale, chartOffset]);
  
  // Convert canvas coordinates to lat/lon
  const canvasToLatLon = useCallback((x: number, y: number): Position => {
    const centerX = canvasSize.width / 2;
    const centerY = canvasSize.height / 2;
    
    const lon = (x - centerX - chartOffset.x) / chartScale + shipState.position.lon;
    const lat = -(y - centerY - chartOffset.y) / chartScale + shipState.position.lat;
    
    return { lat, lon };
  }, [canvasSize, shipState.position, chartScale, chartOffset]);
  
  // Handle canvas resize
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;
    
    const resizeObserver = new ResizeObserver(entries => {
      for (const entry of entries) {
        const { width, height } = entry.contentRect;
        setCanvasSize({ width, height });
      }
    });
    
    resizeObserver.observe(container);
    return () => resizeObserver.disconnect();
  }, []);
  
  // Draw the chart
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    // Clear canvas
    ctx.fillStyle = colors.deepWater;
    ctx.fillRect(0, 0, canvasSize.width, canvasSize.height);
    
    // Draw depth shading (simplified)
    if (displaySettings.depthShading) {
      // Draw medium water area
      ctx.fillStyle = colors.mediumWater;
      ctx.fillRect(0, 0, canvasSize.width, canvasSize.height);
    }
    
    // Draw depth contours
    if (displaySettings.showDepthContours) {
      chart.depthContours.forEach(contour => {
        if (contour.points.length < 2) return;
        
        ctx.beginPath();
        const start = latLonToCanvas(contour.points[0].lat, contour.points[0].lon);
        ctx.moveTo(start.x, start.y);
        
        for (let i = 1; i < contour.points.length; i++) {
          const point = latLonToCanvas(contour.points[i].lat, contour.points[i].lon);
          ctx.lineTo(point.x, point.y);
        }
        
        // Color based on depth
        if (contour.depth <= 10) ctx.strokeStyle = colors.depthContour5;
        else if (contour.depth <= 20) ctx.strokeStyle = colors.depthContour10;
        else if (contour.depth <= 30) ctx.strokeStyle = colors.depthContour20;
        else if (contour.depth <= 50) ctx.strokeStyle = colors.depthContour30;
        else ctx.strokeStyle = colors.depthContour50;
        
        ctx.lineWidth = 1;
        ctx.setLineDash([5, 3]);
        ctx.stroke();
        ctx.setLineDash([]);
        
        // Draw depth label
        if (contour.points.length > 0) {
          const labelPoint = latLonToCanvas(
            contour.points[Math.floor(contour.points.length / 2)].lat,
            contour.points[Math.floor(contour.points.length / 2)].lon
          );
          ctx.fillStyle = colors.sounding;
          ctx.font = '9px Arial';
          ctx.fillText(`${contour.depth}m`, labelPoint.x + 3, labelPoint.y - 3);
        }
      });
    }
    
    // Draw coastlines (land)
    chart.coastlines.forEach(coastline => {
      if (coastline.length < 3) return;
      
      ctx.beginPath();
      const start = latLonToCanvas(coastline[0].lat, coastline[0].lon);
      ctx.moveTo(start.x, start.y);
      
      for (let i = 1; i < coastline.length; i++) {
        const point = latLonToCanvas(coastline[i].lat, coastline[i].lon);
        ctx.lineTo(point.x, point.y);
      }
      
      ctx.closePath();
      ctx.fillStyle = colors.land;
      ctx.fill();
      ctx.strokeStyle = colors.landOutline;
      ctx.lineWidth = 2;
      ctx.stroke();
    });
    
    // Draw TSS (Traffic Separation Scheme)
    if (displaySettings.showTSS && chart.tss) {
      // Draw lanes
      chart.tss.lanes.forEach(lane => {
        if (lane.points.length < 2) return;
        
        ctx.beginPath();
        const start = latLonToCanvas(lane.points[0].lat, lane.points[0].lon);
        ctx.moveTo(start.x, start.y);
        
        for (let i = 1; i < lane.points.length; i++) {
          const point = latLonToCanvas(lane.points[i].lat, lane.points[i].lon);
          ctx.lineTo(point.x, point.y);
        }
        
        ctx.strokeStyle = colors.tssLane;
        ctx.lineWidth = 40;
        ctx.stroke();
        
        // Draw direction arrow
        const midIdx = Math.floor(lane.points.length / 2);
        const midPoint = latLonToCanvas(lane.points[midIdx].lat, lane.points[midIdx].lon);
        
        ctx.save();
        ctx.translate(midPoint.x, midPoint.y);
        ctx.rotate((lane.direction - 90) * Math.PI / 180);
        
        ctx.beginPath();
        ctx.moveTo(15, 0);
        ctx.lineTo(-5, -8);
        ctx.lineTo(-5, 8);
        ctx.closePath();
        ctx.fillStyle = 'rgba(255, 0, 255, 0.6)';
        ctx.fill();
        
        ctx.restore();
      });
      
      // Draw separation zone
      if (chart.tss.separationZone.length > 2) {
        ctx.beginPath();
        const start = latLonToCanvas(chart.tss.separationZone[0].lat, chart.tss.separationZone[0].lon);
        ctx.moveTo(start.x, start.y);
        
        for (let i = 1; i < chart.tss.separationZone.length; i++) {
          const point = latLonToCanvas(chart.tss.separationZone[i].lat, chart.tss.separationZone[i].lon);
          ctx.lineTo(point.x, point.y);
        }
        
        ctx.closePath();
        ctx.fillStyle = colors.tssSeparation;
        ctx.fill();
      }
    }
    
    // Draw soundings
    if (displaySettings.showSoundings) {
      ctx.font = '10px Arial';
      ctx.fillStyle = colors.sounding;
      ctx.textAlign = 'center';
      
      chart.soundings.forEach(sounding => {
        const point = latLonToCanvas(sounding.lat, sounding.lon);
        
        // Check if on screen
        if (point.x < -50 || point.x > canvasSize.width + 50 ||
            point.y < -50 || point.y > canvasSize.height + 50) return;
        
        ctx.fillText(sounding.depth.toString(), point.x, point.y);
      });
    }
    
    // Draw nav aids
    if (displaySettings.showNavAids) {
      chart.navAids.forEach(navAid => {
        const point = latLonToCanvas(navAid.lat, navAid.lon);
        
        // Check if on screen
        if (point.x < -20 || point.x > canvasSize.width + 20 ||
            point.y < -20 || point.y > canvasSize.height + 20) return;
        
        ctx.save();
        ctx.translate(point.x, point.y);
        
        switch (navAid.type) {
          case 'buoy-green':
            ctx.beginPath();
            ctx.moveTo(0, -8);
            ctx.lineTo(6, 4);
            ctx.lineTo(-6, 4);
            ctx.closePath();
            ctx.fillStyle = colors.navAidGreen;
            ctx.fill();
            ctx.strokeStyle = '#000';
            ctx.lineWidth = 1;
            ctx.stroke();
            break;
            
          case 'buoy-red':
            ctx.beginPath();
            ctx.arc(0, 0, 6, 0, Math.PI * 2);
            ctx.fillStyle = colors.navAidRed;
            ctx.fill();
            ctx.strokeStyle = '#000';
            ctx.lineWidth = 1;
            ctx.stroke();
            break;
            
          case 'buoy-yellow':
            ctx.beginPath();
            ctx.moveTo(0, -7);
            ctx.lineTo(7, 0);
            ctx.lineTo(0, 7);
            ctx.lineTo(-7, 0);
            ctx.closePath();
            ctx.fillStyle = colors.navAidYellow;
            ctx.fill();
            ctx.strokeStyle = '#000';
            ctx.lineWidth = 1;
            ctx.stroke();
            break;
            
          case 'lighthouse':
            ctx.beginPath();
            ctx.arc(0, 0, 4, 0, Math.PI * 2);
            ctx.fillStyle = colors.lighthouse;
            ctx.fill();
            ctx.strokeStyle = '#000';
            ctx.lineWidth = 1;
            ctx.stroke();
            
            // Draw light rays
            for (let i = 0; i < 8; i++) {
              const angle = (i * 45) * Math.PI / 180;
              ctx.beginPath();
              ctx.moveTo(Math.cos(angle) * 5, Math.sin(angle) * 5);
              ctx.lineTo(Math.cos(angle) * 12, Math.sin(angle) * 12);
              ctx.strokeStyle = 'rgba(255, 220, 100, 0.6)';
              ctx.lineWidth = 2;
              ctx.stroke();
            }
            break;
            
          case 'beacon':
            ctx.beginPath();
            ctx.rect(-3, -8, 6, 16);
            ctx.fillStyle = '#666';
            ctx.fill();
            ctx.strokeStyle = '#000';
            ctx.stroke();
            break;
        }
        
        // Draw name
        ctx.font = '9px Arial';
        ctx.fillStyle = colors.text;
        ctx.textAlign = 'center';
        ctx.fillText(navAid.name, 0, 18);
        
        ctx.restore();
      });
    }
    
    // Draw range rings
    if (displaySettings.showRangeRings) {
      const shipPos = latLonToCanvas(shipState.position.lat, shipState.position.lon);
      const ringInterval = displaySettings.rangeRingInterval;
      
      for (let i = 1; i <= 5; i++) {
        const radius = i * ringInterval * chartScale / 60; // Convert nm to pixels (approx)
        
        ctx.beginPath();
        ctx.arc(shipPos.x, shipPos.y, radius, 0, Math.PI * 2);
        ctx.strokeStyle = colors.rangeRing;
        ctx.lineWidth = 1;
        ctx.stroke();
        
        // Draw range label
        ctx.fillStyle = colors.text;
        ctx.font = '10px Arial';
        ctx.textAlign = 'left';
        ctx.fillText(`${i * ringInterval} nm`, shipPos.x + radius + 3, shipPos.y);
      }
    }
    
    // Draw waypoints and route
    if (waypoints.length > 0 || route) {
      const wps = route ? route.waypoints : waypoints;
      
      // Draw route legs
      if (wps.length >= 2) {
        ctx.beginPath();
        const start = latLonToCanvas(wps[0].position.lat, wps[0].position.lon);
        ctx.moveTo(start.x, start.y);
        
        for (let i = 1; i < wps.length; i++) {
          const point = latLonToCanvas(wps[i].position.lat, wps[i].position.lon);
          ctx.lineTo(point.x, point.y);
        }
        
        ctx.strokeStyle = colors.route;
        ctx.lineWidth = 2;
        ctx.stroke();
      }
      
      // Draw waypoints
      wps.forEach((wp, index) => {
        const point = latLonToCanvas(wp.position.lat, wp.position.lon);
        
        // Waypoint marker
        ctx.beginPath();
        ctx.arc(point.x, point.y, 8, 0, Math.PI * 2);
        ctx.strokeStyle = colors.waypoint;
        ctx.lineWidth = 2;
        ctx.stroke();
        
        // Cross inside
        ctx.beginPath();
        ctx.moveTo(point.x - 5, point.y);
        ctx.lineTo(point.x + 5, point.y);
        ctx.moveTo(point.x, point.y - 5);
        ctx.lineTo(point.x, point.y + 5);
        ctx.stroke();
        
        // Waypoint number
        ctx.fillStyle = colors.waypoint;
        ctx.font = 'bold 10px Arial';
        ctx.textAlign = 'center';
        ctx.fillText(`${index + 1}`, point.x, point.y - 12);
        ctx.fillText(wp.name, point.x, point.y + 20);
      });
    }
    
    // Draw EBLs
    ebls.forEach(ebl => {
      if (!ebl.active) return;
      
      const shipPos = latLonToCanvas(shipState.position.lat, shipState.position.lon);
      const bearing = ebl.relative ? ebl.bearing + shipState.heading : ebl.bearing;
      const length = Math.max(canvasSize.width, canvasSize.height);
      
      const endX = shipPos.x + Math.sin(bearing * Math.PI / 180) * length;
      const endY = shipPos.y - Math.cos(bearing * Math.PI / 180) * length;
      
      ctx.beginPath();
      ctx.moveTo(shipPos.x, shipPos.y);
      ctx.lineTo(endX, endY);
      ctx.strokeStyle = colors.ebl;
      ctx.lineWidth = 1;
      ctx.setLineDash([10, 5]);
      ctx.stroke();
      ctx.setLineDash([]);
      
      // Draw bearing label
      ctx.fillStyle = colors.ebl;
      ctx.font = '10px Arial';
      const labelX = shipPos.x + Math.sin(bearing * Math.PI / 180) * 100;
      const labelY = shipPos.y - Math.cos(bearing * Math.PI / 180) * 100;
      ctx.fillText(`EBL${ebl.id}: ${bearing.toFixed(1)}°`, labelX, labelY);
    });
    
    // Draw VRMs
    vrms.forEach(vrm => {
      if (!vrm.active) return;
      
      const shipPos = latLonToCanvas(shipState.position.lat, shipState.position.lon);
      const radius = vrm.range * chartScale / 60; // Convert nm to pixels
      
      ctx.beginPath();
      ctx.arc(shipPos.x, shipPos.y, radius, 0, Math.PI * 2);
      ctx.strokeStyle = colors.vrm;
      ctx.lineWidth = 2;
      ctx.setLineDash([8, 4]);
      ctx.stroke();
      ctx.setLineDash([]);
      
      // Draw range label
      ctx.fillStyle = colors.vrm;
      ctx.font = '10px Arial';
      ctx.fillText(`VRM${vrm.id}: ${vrm.range.toFixed(2)} nm`, shipPos.x + radius + 5, shipPos.y);
    });
    
    // Draw targets
    targets.forEach(target => {
      const point = latLonToCanvas(target.position.lat, target.position.lon);
      
      // Check if on screen
      if (point.x < -50 || point.x > canvasSize.width + 50 ||
          point.y < -50 || point.y > canvasSize.height + 50) return;
      
      const isSelected = selectedTarget?.id === target.id;
      const color = target.dangerous ? colors.targetDangerous : colors.target;
      
      // Draw vector
      if (displaySettings.showCOGVector) {
        const vectorEnd = calculateVectorEndpoint(
          target.position,
          target.course,
          target.speed,
          displaySettings.vectorLength
        );
        const endPoint = latLonToCanvas(vectorEnd.lat, vectorEnd.lon);
        
        ctx.beginPath();
        ctx.moveTo(point.x, point.y);
        ctx.lineTo(endPoint.x, endPoint.y);
        ctx.strokeStyle = color;
        ctx.lineWidth = 1;
        ctx.stroke();
        
        // Vector arrow
        const arrowAngle = Math.atan2(endPoint.x - point.x, point.y - endPoint.y);
        ctx.save();
        ctx.translate(endPoint.x, endPoint.y);
        ctx.rotate(arrowAngle);
        ctx.beginPath();
        ctx.moveTo(0, 0);
        ctx.lineTo(-4, 8);
        ctx.lineTo(4, 8);
        ctx.closePath();
        ctx.fillStyle = color;
        ctx.fill();
        ctx.restore();
      }
      
      // Draw target symbol
      ctx.save();
      ctx.translate(point.x, point.y);
      ctx.rotate((target.heading || target.course) * Math.PI / 180);
      
      // Triangle shape pointing in heading direction
      ctx.beginPath();
      ctx.moveTo(0, -10);
      ctx.lineTo(6, 8);
      ctx.lineTo(-6, 8);
      ctx.closePath();
      
      if (isSelected) {
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 3;
        ctx.stroke();
      }
      
      ctx.strokeStyle = color;
      ctx.lineWidth = 2;
      ctx.stroke();
      
      ctx.restore();
      
      // Draw target label
      ctx.fillStyle = color;
      ctx.font = '9px Arial';
      ctx.textAlign = 'center';
      ctx.fillText(target.name, point.x, point.y + 20);
      
      if (target.dangerous) {
        ctx.fillStyle = colors.targetDangerous;
        ctx.fillText(`CPA: ${target.cpa?.toFixed(2)} nm`, point.x, point.y + 30);
      }
    });
    
    // Draw own ship
    const shipPos = latLonToCanvas(shipState.position.lat, shipState.position.lon);
    
    // Heading line
    if (displaySettings.showHeadingLine) {
      const hdgLength = 100;
      const hdgEndX = shipPos.x + Math.sin(shipState.heading * Math.PI / 180) * hdgLength;
      const hdgEndY = shipPos.y - Math.cos(shipState.heading * Math.PI / 180) * hdgLength;
      
      ctx.beginPath();
      ctx.moveTo(shipPos.x, shipPos.y);
      ctx.lineTo(hdgEndX, hdgEndY);
      ctx.strokeStyle = colors.headingLine;
      ctx.lineWidth = 2;
      ctx.stroke();
    }
    
    // COG vector
    if (displaySettings.showCOGVector && shipState.speedOverGround > 0.5) {
      const vectorEnd = calculateVectorEndpoint(
        shipState.position,
        shipState.courseOverGround,
        shipState.speedOverGround,
        displaySettings.vectorLength
      );
      const endPoint = latLonToCanvas(vectorEnd.lat, vectorEnd.lon);
      
      ctx.beginPath();
      ctx.moveTo(shipPos.x, shipPos.y);
      ctx.lineTo(endPoint.x, endPoint.y);
      ctx.strokeStyle = colors.cogVector;
      ctx.lineWidth = 2;
      ctx.stroke();
      
      // Arrow
      const arrowAngle = Math.atan2(endPoint.x - shipPos.x, shipPos.y - endPoint.y);
      ctx.save();
      ctx.translate(endPoint.x, endPoint.y);
      ctx.rotate(arrowAngle);
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.lineTo(-5, 10);
      ctx.lineTo(5, 10);
      ctx.closePath();
      ctx.fillStyle = colors.cogVector;
      ctx.fill();
      ctx.restore();
    }
    
    // Ship symbol
    ctx.save();
    ctx.translate(shipPos.x, shipPos.y);
    ctx.rotate(shipState.heading * Math.PI / 180);
    
    // Ship outline
    ctx.beginPath();
    ctx.moveTo(0, -15);
    ctx.lineTo(8, 10);
    ctx.lineTo(0, 5);
    ctx.lineTo(-8, 10);
    ctx.closePath();
    
    ctx.fillStyle = colors.ownShip;
    ctx.fill();
    ctx.strokeStyle = colors.ownShipOutline;
    ctx.lineWidth = 2;
    ctx.stroke();
    
    ctx.restore();
    
    // Draw cursor info
    if (mousePos && toolMode === 'cursor') {
      const cursorPos = canvasToLatLon(mousePos.x, mousePos.y);
      const bearing = calculateBearing(shipState.position, cursorPos);
      const distance = calculateDistance(shipState.position, cursorPos);
      
      ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
      ctx.fillRect(mousePos.x + 15, mousePos.y + 15, 160, 55);
      
      ctx.fillStyle = '#ffffff';
      ctx.font = '11px monospace';
      ctx.textAlign = 'left';
      ctx.fillText(formatLatitude(cursorPos.lat), mousePos.x + 20, mousePos.y + 30);
      ctx.fillText(formatLongitude(cursorPos.lon), mousePos.x + 20, mousePos.y + 45);
      ctx.fillText(`${formatBearing(bearing)} / ${formatDistance(distance)}`, mousePos.x + 20, mousePos.y + 60);
    }
    
    // Draw planning mode indicator
    if (isPlanning) {
      ctx.fillStyle = 'rgba(255, 0, 255, 0.8)';
      ctx.font = 'bold 14px Arial';
      ctx.textAlign = 'left';
      ctx.fillText('ROUTE PLANNING MODE - Click to add waypoints', 10, 25);
    }
    
  }, [
    canvasSize, chart, shipState, targets, route, waypoints, ebls, vrms,
    displaySettings, latLonToCanvas, canvasToLatLon, colors, mousePos,
    toolMode, isPlanning, selectedTarget
  ]);
  
  // Mouse event handlers
  const handleMouseDown = useCallback((e: React.MouseEvent<HTMLCanvasElement>) => {
    if (e.button === 0) { // Left click
      if (isPlanning) {
        const rect = canvasRef.current?.getBoundingClientRect();
        if (rect) {
          const x = e.clientX - rect.left;
          const y = e.clientY - rect.top;
          const position = canvasToLatLon(x, y);
          onAddWaypoint(position);
        }
      } else {
        setIsDragging(true);
        setDragStart({ x: e.clientX - chartOffset.x, y: e.clientY - chartOffset.y });
      }
    }
  }, [isPlanning, canvasToLatLon, onAddWaypoint, chartOffset]);
  
  const handleMouseMove = useCallback((e: React.MouseEvent<HTMLCanvasElement>) => {
    const rect = canvasRef.current?.getBoundingClientRect();
    if (rect) {
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      setMousePos({ x, y });
      onCursorPositionChange(canvasToLatLon(x, y));
    }
    
    if (isDragging) {
      onChartOffsetChange({
        x: e.clientX - dragStart.x,
        y: e.clientY - dragStart.y
      });
    }
  }, [isDragging, dragStart, onChartOffsetChange, canvasToLatLon, onCursorPositionChange]);
  
  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
  }, []);
  
  const handleMouseLeave = useCallback(() => {
    setIsDragging(false);
    setMousePos(null);
    onCursorPositionChange(null);
  }, [onCursorPositionChange]);
  
  const handleWheel = useCallback((e: React.WheelEvent<HTMLCanvasElement>) => {
    e.preventDefault();
    const delta = e.deltaY > 0 ? 0.9 : 1.1;
    onChartScaleChange(Math.max(1000, Math.min(50000, chartScale * delta)));
  }, [chartScale, onChartScaleChange]);
  
  return (
    <div ref={containerRef} className="w-full h-full">
      <canvas
        ref={canvasRef}
        width={canvasSize.width}
        height={canvasSize.height}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseLeave}
        onWheel={handleWheel}
        style={{ cursor: isPlanning ? 'crosshair' : isDragging ? 'grabbing' : 'grab' }}
      />
    </div>
  );
}
