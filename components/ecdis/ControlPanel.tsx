'use client';

import type { DisplaySettings, ColorScheme } from '@/lib/ecdis/types';

interface ControlPanelProps {
  isRunning: boolean;
  onToggleRunning: () => void;
  timeScale: number;
  onTimeScaleChange: (scale: number) => void;
  showEnginePanel: boolean;
  onToggleEnginePanel: () => void;
  showHelmPanel: boolean;
  onToggleHelmPanel: () => void;
  displaySettings: DisplaySettings;
  onDisplaySettingChange: (key: keyof DisplaySettings, value: unknown) => void;
  colors: ColorScheme;
}

export function ControlPanel({
  isRunning,
  onToggleRunning,
  timeScale,
  onTimeScaleChange,
  showEnginePanel,
  onToggleEnginePanel,
  showHelmPanel,
  onToggleHelmPanel,
  displaySettings,
  onDisplaySettingChange,
  colors
}: ControlPanelProps) {
  
  const panelBg = displaySettings.colorScheme === 'day' ? '#2a2a3a' : 
                  displaySettings.colorScheme === 'dusk' ? '#1a1a2a' : '#0a0a15';
  const borderColor = '#444455';
  
  return (
    <div 
      className="h-14 border-t flex items-center px-4 gap-4"
      style={{ 
        backgroundColor: panelBg,
        borderColor: borderColor
      }}
    >
      {/* Simulation Controls */}
      <div className="flex items-center gap-2">
        <button
          onClick={onToggleRunning}
          className="px-4 py-2 rounded font-bold text-sm"
          style={{
            backgroundColor: isRunning ? '#006600' : '#444455',
            color: isRunning ? '#00ff00' : '#888888'
          }}
        >
          {isRunning ? 'RUNNING' : 'STOPPED'}
        </button>
        
        <div className="flex items-center gap-1 text-xs">
          <span style={{ color: '#888888' }}>TIME x</span>
          <select
            value={timeScale}
            onChange={e => onTimeScaleChange(parseInt(e.target.value))}
            className="px-2 py-1 rounded text-xs"
            style={{ 
              backgroundColor: '#1a1a25', 
              color: '#ffffff',
              border: 'none'
            }}
          >
            <option value="1">1</option>
            <option value="5">5</option>
            <option value="10">10</option>
            <option value="20">20</option>
            <option value="50">50</option>
            <option value="100">100</option>
          </select>
        </div>
      </div>
      
      <div className="w-px h-8 bg-gray-600" />
      
      {/* Panel Toggles */}
      <div className="flex items-center gap-2">
        <button
          onClick={onToggleEnginePanel}
          className="px-3 py-1.5 rounded text-xs font-medium"
          style={{
            backgroundColor: showEnginePanel ? '#004466' : '#333344',
            color: showEnginePanel ? '#00ccff' : '#666666'
          }}
        >
          ENGINE
        </button>
        
        <button
          onClick={onToggleHelmPanel}
          className="px-3 py-1.5 rounded text-xs font-medium"
          style={{
            backgroundColor: showHelmPanel ? '#004466' : '#333344',
            color: showHelmPanel ? '#00ccff' : '#666666'
          }}
        >
          HELM
        </button>
      </div>
      
      <div className="w-px h-8 bg-gray-600" />
      
      {/* Display Toggles */}
      <div className="flex items-center gap-2">
        <button
          onClick={() => onDisplaySettingChange('showDepthContours', !displaySettings.showDepthContours)}
          className="px-2 py-1 rounded text-[10px] font-medium"
          style={{
            backgroundColor: displaySettings.showDepthContours ? '#004466' : '#333344',
            color: displaySettings.showDepthContours ? '#00ccff' : '#666666'
          }}
        >
          CONTOURS
        </button>
        
        <button
          onClick={() => onDisplaySettingChange('showSoundings', !displaySettings.showSoundings)}
          className="px-2 py-1 rounded text-[10px] font-medium"
          style={{
            backgroundColor: displaySettings.showSoundings ? '#004466' : '#333344',
            color: displaySettings.showSoundings ? '#00ccff' : '#666666'
          }}
        >
          SOUNDINGS
        </button>
        
        <button
          onClick={() => onDisplaySettingChange('showNavAids', !displaySettings.showNavAids)}
          className="px-2 py-1 rounded text-[10px] font-medium"
          style={{
            backgroundColor: displaySettings.showNavAids ? '#004466' : '#333344',
            color: displaySettings.showNavAids ? '#00ccff' : '#666666'
          }}
        >
          NAV AIDS
        </button>
        
        <button
          onClick={() => onDisplaySettingChange('showTSS', !displaySettings.showTSS)}
          className="px-2 py-1 rounded text-[10px] font-medium"
          style={{
            backgroundColor: displaySettings.showTSS ? '#004466' : '#333344',
            color: displaySettings.showTSS ? '#00ccff' : '#666666'
          }}
        >
          TSS
        </button>
        
        <button
          onClick={() => onDisplaySettingChange('showRangeRings', !displaySettings.showRangeRings)}
          className="px-2 py-1 rounded text-[10px] font-medium"
          style={{
            backgroundColor: displaySettings.showRangeRings ? '#004466' : '#333344',
            color: displaySettings.showRangeRings ? '#00ccff' : '#666666'
          }}
        >
          RINGS
        </button>
      </div>
      
      <div className="w-px h-8 bg-gray-600" />
      
      {/* Vector Length */}
      <div className="flex items-center gap-1 text-xs">
        <span style={{ color: '#888888' }}>VECTOR</span>
        <select
          value={displaySettings.vectorLength}
          onChange={e => onDisplaySettingChange('vectorLength', parseInt(e.target.value))}
          className="px-2 py-1 rounded text-xs"
          style={{ 
            backgroundColor: '#1a1a25', 
            color: '#ffffff',
            border: 'none'
          }}
        >
          <option value="3">3 min</option>
          <option value="6">6 min</option>
          <option value="12">12 min</option>
          <option value="15">15 min</option>
          <option value="30">30 min</option>
        </select>
      </div>
      
      <div className="w-px h-8 bg-gray-600" />
      
      {/* Color Scheme */}
      <div className="flex items-center gap-1 text-xs">
        <span style={{ color: '#888888' }}>MODE</span>
        <select
          value={displaySettings.colorScheme}
          onChange={e => onDisplaySettingChange('colorScheme', e.target.value)}
          className="px-2 py-1 rounded text-xs"
          style={{ 
            backgroundColor: '#1a1a25', 
            color: '#ffffff',
            border: 'none'
          }}
        >
          <option value="day">DAY</option>
          <option value="dusk">DUSK</option>
          <option value="night">NIGHT</option>
        </select>
      </div>
      
      {/* Spacer */}
      <div className="flex-1" />
      
      {/* Status */}
      <div className="text-xs font-mono" style={{ color: '#888888' }}>
        JRC ECDIS 9201 SIMULATOR
      </div>
    </div>
  );
}
