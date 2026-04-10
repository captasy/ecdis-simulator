'use client';

import { useState, useEffect } from 'react';
import type { ShipState, Current } from '@/lib/ecdis/physics';
import type { Position } from '@/lib/ecdis/navigation';
import type { EBL, VRM, DisplaySettings, ToolMode, ColorScheme } from '@/lib/ecdis/types';
import { 
  formatLatitude, 
  formatLongitude, 
  formatBearing, 
  formatDistance,
  calculateBearing,
  calculateDistance
} from '@/lib/ecdis/navigation';

interface NavigationPanelProps {
  shipState: ShipState;
  cursorPosition: Position | null;
  displaySettings: DisplaySettings;
  ebls: EBL[];
  vrms: VRM[];
  onToggleEBL: (id: number) => void;
  onToggleVRM: (id: number) => void;
  onEBLBearingChange: (id: number, bearing: number) => void;
  onVRMRangeChange: (id: number, range: number) => void;
  toolMode: ToolMode;
  onToolModeChange: (mode: ToolMode) => void;
  chartScale: number;
  colors: ColorScheme;
  current: Current;
}

export function NavigationPanel({
  shipState,
  cursorPosition,
  displaySettings,
  ebls,
  vrms,
  onToggleEBL,
  onToggleVRM,
  onEBLBearingChange,
  onVRMRangeChange,
  toolMode,
  onToolModeChange,
  chartScale,
  colors,
  current
}: NavigationPanelProps) {
  const [currentTime, setCurrentTime] = useState<string | null>(null);
  const [currentDate, setCurrentDate] = useState<string | null>(null);
  
  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setCurrentTime(now.toISOString().substring(11, 19));
      setCurrentDate(now.toISOString().substring(0, 10));
    };
    
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);
  
  const panelBg = displaySettings.colorScheme === 'day' ? '#2a2a3a' : 
                  displaySettings.colorScheme === 'dusk' ? '#1a1a2a' : '#0a0a15';
  const textColor = '#00ff88';
  const labelColor = '#888888';
  const borderColor = '#444455';
  
  return (
    <div 
      className="w-72 h-full flex flex-col border-l overflow-y-auto"
      style={{ 
        backgroundColor: panelBg,
        borderColor: borderColor
      }}
    >
      {/* Own Ship Data */}
      <div className="p-3 border-b" style={{ borderColor }}>
        <div className="text-xs font-bold mb-2" style={{ color: '#ffcc00' }}>
          OWN SHIP
        </div>
        
        <div className="grid grid-cols-1 gap-1 text-xs font-mono">
          <div className="flex justify-between">
            <span style={{ color: labelColor }}>LAT</span>
            <span style={{ color: textColor }}>{formatLatitude(shipState.position.lat)}</span>
          </div>
          <div className="flex justify-between">
            <span style={{ color: labelColor }}>LON</span>
            <span style={{ color: textColor }}>{formatLongitude(shipState.position.lon)}</span>
          </div>
        </div>
      </div>
      
      {/* Course & Speed */}
      <div className="p-3 border-b" style={{ borderColor }}>
        <div className="text-xs font-bold mb-2" style={{ color: '#ffcc00' }}>
          COURSE / SPEED
        </div>
        
        <div className="grid grid-cols-2 gap-2 text-xs font-mono">
          <div className="p-2 rounded" style={{ backgroundColor: '#1a1a25' }}>
            <div style={{ color: labelColor }} className="text-[10px]">HDG (CSE STEERED)</div>
            <div style={{ color: textColor }} className="text-lg">{shipState.heading.toFixed(1)}°</div>
          </div>
          <div className="p-2 rounded" style={{ backgroundColor: '#1a1a25' }}>
            <div style={{ color: labelColor }} className="text-[10px]">COG (CSE M/GOOD)</div>
            <div style={{ color: '#00ffff' }} className="text-lg">{shipState.courseOverGround.toFixed(1)}°</div>
          </div>
          <div className="p-2 rounded" style={{ backgroundColor: '#1a1a25' }}>
            <div style={{ color: labelColor }} className="text-[10px]">STW (SPD/WATER)</div>
            <div style={{ color: textColor }} className="text-lg">{shipState.speedThroughWater.toFixed(1)} kn</div>
          </div>
          <div className="p-2 rounded" style={{ backgroundColor: '#1a1a25' }}>
            <div style={{ color: labelColor }} className="text-[10px]">SOG (SPD M/GOOD)</div>
            <div style={{ color: '#00ffff' }} className="text-lg">{shipState.speedOverGround.toFixed(1)} kn</div>
          </div>
        </div>
        
        <div className="mt-2 grid grid-cols-2 gap-2 text-xs font-mono">
          <div className="p-2 rounded" style={{ backgroundColor: '#1a1a25' }}>
            <div style={{ color: labelColor }} className="text-[10px]">RUDDER</div>
            <div style={{ color: shipState.rudderAngle !== 0 ? '#ff8800' : textColor }}>
              {shipState.rudderAngle > 0 ? 'S' : shipState.rudderAngle < 0 ? 'P' : ''}{Math.abs(shipState.rudderAngle).toFixed(1)}°
            </div>
          </div>
          <div className="p-2 rounded" style={{ backgroundColor: '#1a1a25' }}>
            <div style={{ color: labelColor }} className="text-[10px]">ROT</div>
            <div style={{ color: Math.abs(shipState.rateOfTurn) > 5 ? '#ff8800' : textColor }}>
              {shipState.rateOfTurn.toFixed(1)}°/min
            </div>
          </div>
        </div>
      </div>
      
      {/* Current */}
      <div className="p-3 border-b" style={{ borderColor }}>
        <div className="text-xs font-bold mb-2" style={{ color: '#ffcc00' }}>
          CURRENT
        </div>
        
        <div className="grid grid-cols-2 gap-2 text-xs font-mono">
          <div className="p-2 rounded" style={{ backgroundColor: '#1a1a25' }}>
            <div style={{ color: labelColor }} className="text-[10px]">SET</div>
            <div style={{ color: '#88ccff' }}>{current.set.toFixed(1)}°</div>
          </div>
          <div className="p-2 rounded" style={{ backgroundColor: '#1a1a25' }}>
            <div style={{ color: labelColor }} className="text-[10px]">DRIFT</div>
            <div style={{ color: '#88ccff' }}>{current.drift.toFixed(1)} kn</div>
          </div>
        </div>
      </div>
      
      {/* Depth */}
      <div className="p-3 border-b" style={{ borderColor }}>
        <div className="text-xs font-bold mb-2" style={{ color: '#ffcc00' }}>
          DEPTH
        </div>
        
        <div className="p-2 rounded text-center" style={{ backgroundColor: '#1a1a25' }}>
          <div style={{ color: labelColor }} className="text-[10px]">UNDER KEEL</div>
          <div style={{ color: shipState.depth < 15 ? '#ff4444' : textColor }} className="text-2xl">
            {shipState.depth.toFixed(1)} m
          </div>
        </div>
      </div>
      
      {/* EBL / VRM */}
      <div className="p-3 border-b" style={{ borderColor }}>
        <div className="text-xs font-bold mb-2" style={{ color: '#ffcc00' }}>
          EBL / VRM
        </div>
        
        <div className="space-y-2">
          {ebls.map(ebl => (
            <div key={ebl.id} className="flex items-center gap-2 text-xs">
              <button
                onClick={() => onToggleEBL(ebl.id)}
                className="px-2 py-1 rounded text-[10px] font-bold"
                style={{
                  backgroundColor: ebl.active ? '#006666' : '#333344',
                  color: ebl.active ? '#00ffff' : '#666666'
                }}
              >
                EBL{ebl.id}
              </button>
              <input
                type="number"
                value={ebl.bearing.toFixed(1)}
                onChange={e => onEBLBearingChange(ebl.id, parseFloat(e.target.value) || 0)}
                className="w-16 px-1 py-0.5 rounded text-right font-mono"
                style={{ 
                  backgroundColor: '#1a1a25', 
                  color: ebl.active ? '#00ffff' : '#444444',
                  border: 'none'
                }}
                disabled={!ebl.active}
                step="0.1"
              />
              <span style={{ color: labelColor }}>°</span>
            </div>
          ))}
          
          {vrms.map(vrm => (
            <div key={vrm.id} className="flex items-center gap-2 text-xs">
              <button
                onClick={() => onToggleVRM(vrm.id)}
                className="px-2 py-1 rounded text-[10px] font-bold"
                style={{
                  backgroundColor: vrm.active ? '#006666' : '#333344',
                  color: vrm.active ? '#00ffff' : '#666666'
                }}
              >
                VRM{vrm.id}
              </button>
              <input
                type="number"
                value={vrm.range.toFixed(2)}
                onChange={e => onVRMRangeChange(vrm.id, parseFloat(e.target.value) || 0)}
                className="w-16 px-1 py-0.5 rounded text-right font-mono"
                style={{ 
                  backgroundColor: '#1a1a25', 
                  color: vrm.active ? '#00ffff' : '#444444',
                  border: 'none'
                }}
                disabled={!vrm.active}
                step="0.01"
              />
              <span style={{ color: labelColor }}>nm</span>
            </div>
          ))}
        </div>
      </div>
      
      {/* Cursor Info */}
      <div className="p-3 border-b" style={{ borderColor }}>
        <div className="text-xs font-bold mb-2" style={{ color: '#ffcc00' }}>
          CURSOR
        </div>
        
        {cursorPosition ? (
          <div className="grid grid-cols-1 gap-1 text-xs font-mono">
            <div className="flex justify-between">
              <span style={{ color: labelColor }}>LAT</span>
              <span style={{ color: '#ffffff' }}>{formatLatitude(cursorPosition.lat)}</span>
            </div>
            <div className="flex justify-between">
              <span style={{ color: labelColor }}>LON</span>
              <span style={{ color: '#ffffff' }}>{formatLongitude(cursorPosition.lon)}</span>
            </div>
            <div className="flex justify-between">
              <span style={{ color: labelColor }}>BRG</span>
              <span style={{ color: '#ffffff' }}>
                {formatBearing(calculateBearing(shipState.position, cursorPosition))}
              </span>
            </div>
            <div className="flex justify-between">
              <span style={{ color: labelColor }}>RNG</span>
              <span style={{ color: '#ffffff' }}>
                {formatDistance(calculateDistance(shipState.position, cursorPosition))}
              </span>
            </div>
          </div>
        ) : (
          <div className="text-xs font-mono" style={{ color: labelColor }}>
            Move cursor over chart
          </div>
        )}
      </div>
      
      {/* Scale / Range */}
      <div className="p-3 border-b" style={{ borderColor }}>
        <div className="text-xs font-bold mb-2" style={{ color: '#ffcc00' }}>
          DISPLAY
        </div>
        
        <div className="grid grid-cols-2 gap-2 text-xs font-mono">
          <div className="p-2 rounded" style={{ backgroundColor: '#1a1a25' }}>
            <div style={{ color: labelColor }} className="text-[10px]">SCALE</div>
            <div style={{ color: '#ffffff' }}>{chartScale.toFixed(0)}</div>
          </div>
          <div className="p-2 rounded" style={{ backgroundColor: '#1a1a25' }}>
            <div style={{ color: labelColor }} className="text-[10px]">VECTOR</div>
            <div style={{ color: '#ffffff' }}>{displaySettings.vectorLength} min</div>
          </div>
        </div>
      </div>
      
      {/* Time */}
      <div className="p-3">
        <div className="text-xs font-bold mb-2" style={{ color: '#ffcc00' }}>
          TIME (UTC)
        </div>
        
        <div className="p-2 rounded text-center font-mono" style={{ backgroundColor: '#1a1a25' }}>
          <div style={{ color: '#ffffff' }} className="text-lg">
            {currentTime ?? '--:--:--'}
          </div>
          <div style={{ color: labelColor }} className="text-[10px]">
            {currentDate ?? '----/--/--'}
          </div>
        </div>
      </div>
    </div>
  );
}
