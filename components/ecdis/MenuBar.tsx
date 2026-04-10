'use client';

import { useState } from 'react';
import type { ChartData } from '@/lib/ecdis/charts';
import { allCharts } from '@/lib/ecdis/charts';
import type { DisplaySettings, ColorScheme } from '@/lib/ecdis/types';

interface MenuBarProps {
  currentChart: ChartData;
  onChartChange: (chartId: string) => void;
  displaySettings: DisplaySettings;
  onDisplaySettingChange: (key: keyof DisplaySettings, value: unknown) => void;
  isRunning: boolean;
  onToggleRunning: () => void;
  timeScale: number;
  onTimeScaleChange: (scale: number) => void;
  onToggleRoutePanel: () => void;
  onToggleTargetList: () => void;
  isPlanning: boolean;
  onTogglePlanning: () => void;
  colors: ColorScheme;
}

export function MenuBar({
  currentChart,
  onChartChange,
  displaySettings,
  onDisplaySettingChange,
  isRunning,
  onToggleRunning,
  timeScale,
  onTimeScaleChange,
  onToggleRoutePanel,
  onToggleTargetList,
  isPlanning,
  onTogglePlanning,
  colors
}: MenuBarProps) {
  const [activeMenu, setActiveMenu] = useState<string | null>(null);
  
  const panelBg = displaySettings.colorScheme === 'day' ? '#2a2a3a' : 
                  displaySettings.colorScheme === 'dusk' ? '#1a1a2a' : '#0a0a15';
  const borderColor = '#444455';
  
  const menuItems = [
    {
      label: 'CHART',
      items: allCharts.map(chart => ({
        label: chart.name,
        action: () => onChartChange(chart.id),
        active: currentChart.id === chart.id
      }))
    },
    {
      label: 'DISPLAY',
      items: [
        { label: 'Depth Contours', action: () => onDisplaySettingChange('showDepthContours', !displaySettings.showDepthContours), active: displaySettings.showDepthContours },
        { label: 'Soundings', action: () => onDisplaySettingChange('showSoundings', !displaySettings.showSoundings), active: displaySettings.showSoundings },
        { label: 'Nav Aids', action: () => onDisplaySettingChange('showNavAids', !displaySettings.showNavAids), active: displaySettings.showNavAids },
        { label: 'TSS', action: () => onDisplaySettingChange('showTSS', !displaySettings.showTSS), active: displaySettings.showTSS },
        { label: 'Range Rings', action: () => onDisplaySettingChange('showRangeRings', !displaySettings.showRangeRings), active: displaySettings.showRangeRings },
        { label: 'Heading Line', action: () => onDisplaySettingChange('showHeadingLine', !displaySettings.showHeadingLine), active: displaySettings.showHeadingLine },
        { label: 'COG Vector', action: () => onDisplaySettingChange('showCOGVector', !displaySettings.showCOGVector), active: displaySettings.showCOGVector },
      ]
    },
    {
      label: 'ROUTE',
      items: [
        { label: 'Route Panel', action: onToggleRoutePanel },
        { label: isPlanning ? 'Stop Planning' : 'Start Planning', action: onTogglePlanning, active: isPlanning },
      ]
    },
    {
      label: 'TARGETS',
      items: [
        { label: 'Target List', action: onToggleTargetList },
      ]
    },
    {
      label: 'TOOLS',
      items: [
        { label: 'EBL 1', action: () => {} },
        { label: 'EBL 2', action: () => {} },
        { label: 'VRM 1', action: () => {} },
        { label: 'VRM 2', action: () => {} },
      ]
    },
    {
      label: 'SETTINGS',
      items: [
        { label: 'Day Mode', action: () => onDisplaySettingChange('colorScheme', 'day'), active: displaySettings.colorScheme === 'day' },
        { label: 'Dusk Mode', action: () => onDisplaySettingChange('colorScheme', 'dusk'), active: displaySettings.colorScheme === 'dusk' },
        { label: 'Night Mode', action: () => onDisplaySettingChange('colorScheme', 'night'), active: displaySettings.colorScheme === 'night' },
      ]
    }
  ];
  
  return (
    <div 
      className="h-10 border-b flex items-center px-2 relative z-50"
      style={{ 
        backgroundColor: panelBg,
        borderColor: borderColor
      }}
    >
      {/* JRC Logo / Title */}
      <div className="flex items-center gap-2 mr-4">
        <div 
          className="px-2 py-1 rounded text-xs font-bold"
          style={{ backgroundColor: '#003366', color: '#ffffff' }}
        >
          JRC
        </div>
        <span className="text-sm font-medium" style={{ color: '#ffffff' }}>
          ECDIS JAN-9201
        </span>
      </div>
      
      <div className="w-px h-6 bg-gray-600 mx-2" />
      
      {/* Menu Items */}
      {menuItems.map(menu => (
        <div 
          key={menu.label}
          className="relative"
          onMouseEnter={() => setActiveMenu(menu.label)}
          onMouseLeave={() => setActiveMenu(null)}
        >
          <button
            className="px-3 py-2 text-xs font-medium hover:bg-opacity-50"
            style={{ 
              color: activeMenu === menu.label ? '#00ccff' : '#aaaaaa',
              backgroundColor: activeMenu === menu.label ? '#333344' : 'transparent'
            }}
          >
            {menu.label}
          </button>
          
          {activeMenu === menu.label && (
            <div 
              className="absolute top-full left-0 min-w-48 py-1 rounded-b shadow-lg"
              style={{ backgroundColor: '#2a2a3a', border: `1px solid ${borderColor}` }}
            >
              {menu.items.map((item, index) => (
                <button
                  key={index}
                  onClick={() => {
                    item.action();
                    setActiveMenu(null);
                  }}
                  className="w-full px-4 py-2 text-left text-xs hover:bg-opacity-50 flex items-center justify-between"
                  style={{ 
                    color: item.active ? '#00ff88' : '#cccccc',
                    backgroundColor: 'transparent'
                  }}
                  onMouseEnter={e => (e.target as HTMLElement).style.backgroundColor = '#333344'}
                  onMouseLeave={e => (e.target as HTMLElement).style.backgroundColor = 'transparent'}
                >
                  <span>{item.label}</span>
                  {item.active && (
                    <span style={{ color: '#00ff88' }}>✓</span>
                  )}
                </button>
              ))}
            </div>
          )}
        </div>
      ))}
      
      <div className="flex-1" />
      
      {/* Current Chart Display */}
      <div className="flex items-center gap-2 text-xs">
        <span style={{ color: '#888888' }}>CHART:</span>
        <span style={{ color: '#00ccff' }} className="font-medium">
          {currentChart.name}
        </span>
      </div>
      
      <div className="w-px h-6 bg-gray-600 mx-4" />
      
      {/* Simulation Status */}
      <div className="flex items-center gap-2">
        <div 
          className="w-3 h-3 rounded-full"
          style={{ backgroundColor: isRunning ? '#00ff00' : '#ff4444' }}
        />
        <span className="text-xs" style={{ color: isRunning ? '#00ff00' : '#ff4444' }}>
          {isRunning ? 'SIM ON' : 'SIM OFF'}
        </span>
      </div>
    </div>
  );
}
