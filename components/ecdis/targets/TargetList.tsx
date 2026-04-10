'use client';

import type { Target } from '@/lib/ecdis/targets';
import type { ColorScheme } from '@/lib/ecdis/types';

interface TargetListProps {
  targets: Target[];
  selectedTarget: Target | null;
  onTargetSelect: (target: Target | null) => void;
  colors: ColorScheme;
}

export function TargetList({
  targets,
  selectedTarget,
  onTargetSelect,
  colors
}: TargetListProps) {
  
  // Sort targets by CPA (dangerous ones first)
  const sortedTargets = [...targets].sort((a, b) => {
    if (a.dangerous && !b.dangerous) return -1;
    if (!a.dangerous && b.dangerous) return 1;
    return (a.cpa || 999) - (b.cpa || 999);
  });
  
  return (
    <div 
      className="rounded-lg p-3 w-72"
      style={{ 
        backgroundColor: 'rgba(26, 26, 42, 0.95)',
        border: '2px solid #333344'
      }}
    >
      <div className="text-xs font-bold mb-3" style={{ color: '#ffcc00' }}>
        TARGET LIST ({targets.length})
      </div>
      
      {/* Header */}
      <div 
        className="grid grid-cols-12 gap-1 px-2 py-1 text-[9px] font-bold rounded-t"
        style={{ backgroundColor: '#1a1a25', color: '#888888' }}
      >
        <div className="col-span-3">NAME</div>
        <div className="col-span-2">COG</div>
        <div className="col-span-2">SOG</div>
        <div className="col-span-2">CPA</div>
        <div className="col-span-3">TCPA</div>
      </div>
      
      {/* Target List */}
      <div 
        className="max-h-60 overflow-y-auto rounded-b"
        style={{ 
          backgroundColor: '#0a0a15',
          border: '1px solid #333344',
          borderTop: 'none'
        }}
      >
        {sortedTargets.length === 0 ? (
          <div className="px-2 py-4 text-center text-xs" style={{ color: '#666666' }}>
            No targets
          </div>
        ) : (
          sortedTargets.map(target => (
            <button
              key={target.id}
              onClick={() => onTargetSelect(selectedTarget?.id === target.id ? null : target)}
              className="w-full grid grid-cols-12 gap-1 px-2 py-1.5 text-[9px] border-t text-left transition-colors"
              style={{ 
                borderColor: '#222233',
                backgroundColor: selectedTarget?.id === target.id ? '#333344' : 'transparent',
                color: target.dangerous ? '#ff4444' : '#00ff88'
              }}
            >
              <div className="col-span-3 truncate font-medium">
                {target.name}
              </div>
              <div className="col-span-2">
                {target.course.toFixed(0)}°
              </div>
              <div className="col-span-2">
                {target.speed.toFixed(1)}
              </div>
              <div className="col-span-2" style={{ color: target.dangerous ? '#ff4444' : undefined }}>
                {target.cpa?.toFixed(2) || '-'}
              </div>
              <div className="col-span-3" style={{ color: target.dangerous ? '#ff4444' : undefined }}>
                {target.tcpa ? (
                  target.tcpa > 0 ? `${target.tcpa.toFixed(1)} min` : 'PASSED'
                ) : '-'}
              </div>
            </button>
          ))
        )}
      </div>
      
      {/* Selected Target Details */}
      {selectedTarget && (
        <div 
          className="mt-3 p-2 rounded"
          style={{ 
            backgroundColor: '#0a0a15',
            border: `1px solid ${selectedTarget.dangerous ? '#ff4444' : '#333344'}`
          }}
        >
          <div className="text-xs font-bold mb-2" style={{ color: selectedTarget.dangerous ? '#ff4444' : '#00ff88' }}>
            {selectedTarget.name}
            {selectedTarget.dangerous && ' - DANGEROUS'}
          </div>
          
          <div className="grid grid-cols-2 gap-2 text-[10px]">
            <div>
              <div style={{ color: '#888888' }}>TYPE</div>
              <div style={{ color: '#ffffff' }}>{selectedTarget.type.toUpperCase()}</div>
            </div>
            <div>
              <div style={{ color: '#888888' }}>MMSI</div>
              <div style={{ color: '#ffffff' }}>{selectedTarget.mmsi || 'N/A'}</div>
            </div>
            <div>
              <div style={{ color: '#888888' }}>COURSE</div>
              <div style={{ color: '#00ff88' }}>{selectedTarget.course.toFixed(1)}°</div>
            </div>
            <div>
              <div style={{ color: '#888888' }}>SPEED</div>
              <div style={{ color: '#00ff88' }}>{selectedTarget.speed.toFixed(1)} kn</div>
            </div>
            <div>
              <div style={{ color: '#888888' }}>CPA</div>
              <div style={{ color: selectedTarget.dangerous ? '#ff4444' : '#00ffff' }}>
                {selectedTarget.cpa?.toFixed(3) || '-'} nm
              </div>
            </div>
            <div>
              <div style={{ color: '#888888' }}>TCPA</div>
              <div style={{ color: selectedTarget.dangerous ? '#ff4444' : '#00ffff' }}>
                {selectedTarget.tcpa ? (
                  selectedTarget.tcpa > 0 ? `${selectedTarget.tcpa.toFixed(1)} min` : 'PASSED'
                ) : '-'}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
