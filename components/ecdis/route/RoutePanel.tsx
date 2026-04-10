'use client';

import type { Route, Waypoint } from '@/lib/ecdis/navigation';
import { formatLatitude, formatLongitude, formatBearing, formatDistance } from '@/lib/ecdis/navigation';
import type { ColorScheme } from '@/lib/ecdis/types';

interface RoutePanelProps {
  waypoints: Waypoint[];
  route: Route | null;
  isPlanning: boolean;
  onTogglePlanning: () => void;
  onCreateRoute: () => void;
  onClearRoute: () => void;
  onWaypointsChange: (waypoints: Waypoint[]) => void;
  colors: ColorScheme;
}

export function RoutePanel({
  waypoints,
  route,
  isPlanning,
  onTogglePlanning,
  onCreateRoute,
  onClearRoute,
  onWaypointsChange,
  colors
}: RoutePanelProps) {
  
  const wps = route ? route.waypoints : waypoints;
  const legs = route?.legs || [];
  
  const handleRemoveWaypoint = (index: number) => {
    const newWaypoints = [...waypoints];
    newWaypoints.splice(index, 1);
    onWaypointsChange(newWaypoints);
  };
  
  return (
    <div 
      className="rounded-lg p-3 w-80"
      style={{ 
        backgroundColor: 'rgba(26, 26, 42, 0.95)',
        border: '2px solid #333344'
      }}
    >
      <div className="flex items-center justify-between mb-3">
        <div className="text-xs font-bold" style={{ color: '#ffcc00' }}>
          ROUTE PLANNING
        </div>
        <button
          onClick={onTogglePlanning}
          className="px-2 py-1 rounded text-[10px] font-bold"
          style={{
            backgroundColor: isPlanning ? '#660066' : '#333344',
            color: isPlanning ? '#ff00ff' : '#888888'
          }}
        >
          {isPlanning ? 'PLANNING...' : 'PLAN'}
        </button>
      </div>
      
      {/* Waypoints Table */}
      <div 
        className="rounded overflow-hidden mb-3"
        style={{ 
          backgroundColor: '#0a0a15',
          border: '1px solid #333344'
        }}
      >
        {/* Header */}
        <div 
          className="grid grid-cols-12 gap-1 px-2 py-1 text-[9px] font-bold"
          style={{ backgroundColor: '#1a1a25', color: '#888888' }}
        >
          <div className="col-span-1">#</div>
          <div className="col-span-4">POSITION</div>
          <div className="col-span-2">CSE</div>
          <div className="col-span-2">DIST</div>
          <div className="col-span-2">SPD</div>
          <div className="col-span-1"></div>
        </div>
        
        {/* Waypoints */}
        <div className="max-h-48 overflow-y-auto">
          {wps.length === 0 ? (
            <div className="px-2 py-4 text-center text-xs" style={{ color: '#666666' }}>
              No waypoints. Click chart to add.
            </div>
          ) : (
            wps.map((wp, index) => {
              const leg = legs[index];
              return (
                <div 
                  key={wp.id}
                  className="grid grid-cols-12 gap-1 px-2 py-1 text-[9px] border-t"
                  style={{ borderColor: '#222233', color: '#00ff88' }}
                >
                  <div className="col-span-1" style={{ color: '#ff00ff' }}>{index + 1}</div>
                  <div className="col-span-4 font-mono text-[8px]">
                    {formatLatitude(wp.position.lat).slice(0, 10)}<br/>
                    {formatLongitude(wp.position.lon).slice(0, 11)}
                  </div>
                  <div className="col-span-2">
                    {leg ? `${leg.course.toFixed(1)}°` : '-'}
                  </div>
                  <div className="col-span-2">
                    {leg ? `${leg.distance.toFixed(2)}` : '-'}
                  </div>
                  <div className="col-span-2">
                    {wp.speed || 12}
                  </div>
                  <div className="col-span-1">
                    {!route && (
                      <button
                        onClick={() => handleRemoveWaypoint(index)}
                        className="text-red-500 hover:text-red-400"
                      >
                        ×
                      </button>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
      
      {/* Route Summary */}
      {route && (
        <div 
          className="rounded p-2 mb-3"
          style={{ 
            backgroundColor: '#0a0a15',
            border: '1px solid #333344'
          }}
        >
          <div className="grid grid-cols-2 gap-2 text-xs">
            <div>
              <div className="text-[9px]" style={{ color: '#888888' }}>TOTAL DIST</div>
              <div style={{ color: '#00ff88' }}>{route.totalDistance.toFixed(2)} nm</div>
            </div>
            <div>
              <div className="text-[9px]" style={{ color: '#888888' }}>WAYPOINTS</div>
              <div style={{ color: '#00ff88' }}>{route.waypoints.length}</div>
            </div>
          </div>
        </div>
      )}
      
      {/* Action Buttons */}
      <div className="flex gap-2">
        {!route && waypoints.length >= 2 && (
          <button
            onClick={onCreateRoute}
            className="flex-1 px-3 py-2 rounded text-xs font-bold"
            style={{
              backgroundColor: '#006600',
              color: '#00ff00'
            }}
          >
            CREATE ROUTE
          </button>
        )}
        
        {(route || waypoints.length > 0) && (
          <button
            onClick={onClearRoute}
            className="flex-1 px-3 py-2 rounded text-xs font-bold"
            style={{
              backgroundColor: '#660000',
              color: '#ff4444'
            }}
          >
            CLEAR
          </button>
        )}
      </div>
      
      {/* Passage Plan */}
      {route && (
        <div className="mt-3">
          <div className="text-xs font-bold mb-2" style={{ color: '#ffcc00' }}>
            PASSAGE PLAN
          </div>
          <div 
            className="rounded overflow-hidden text-[9px]"
            style={{ 
              backgroundColor: '#0a0a15',
              border: '1px solid #333344'
            }}
          >
            <div 
              className="grid grid-cols-5 gap-1 px-2 py-1 font-bold"
              style={{ backgroundColor: '#1a1a25', color: '#888888' }}
            >
              <div>LEG</div>
              <div>FROM</div>
              <div>TO</div>
              <div>CSE</div>
              <div>DIST</div>
            </div>
            {route.legs.map((leg, index) => (
              <div 
                key={index}
                className="grid grid-cols-5 gap-1 px-2 py-1 border-t"
                style={{ borderColor: '#222233', color: '#00ff88' }}
              >
                <div style={{ color: '#ff00ff' }}>{index + 1}</div>
                <div>{leg.from.name}</div>
                <div>{leg.to.name}</div>
                <div>{leg.course.toFixed(1)}°</div>
                <div>{leg.distance.toFixed(2)}</div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
