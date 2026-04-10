'use client';

import { 
  type HelmOrder, 
  helmOrders, 
  getHelmOrderText,
  getTargetRudderAngle,
  defaultShipCharacteristics
} from '@/lib/ecdis/physics';
import type { ColorScheme } from '@/lib/ecdis/types';

interface HelmControlProps {
  currentOrder: HelmOrder;
  rudderAngle: number;
  onOrderChange: (order: HelmOrder) => void;
  colors: ColorScheme;
}

export function HelmControl({
  currentOrder,
  rudderAngle,
  onOrderChange,
  colors
}: HelmControlProps) {
  
  const portOrders: HelmOrder[] = ['HARD_PORT', 'PORT_20', 'PORT_15', 'PORT_10', 'PORT_5'];
  const stbdOrders: HelmOrder[] = ['STBD_5', 'STBD_10', 'STBD_15', 'STBD_20', 'HARD_STBD'];
  
  const getOrderColor = (order: HelmOrder) => {
    if (order === currentOrder) {
      if (order.includes('PORT')) return '#ff4444';
      if (order.includes('STBD')) return '#00ff00';
      return '#ffcc00';
    }
    return '#555555';
  };
  
  const getBackgroundColor = (order: HelmOrder) => {
    if (order === currentOrder) {
      if (order.includes('PORT')) return '#330000';
      if (order.includes('STBD')) return '#003300';
      return '#333300';
    }
    return '#1a1a25';
  };
  
  // Calculate rudder indicator position
  const rudderIndicatorX = (rudderAngle / 35) * 60; // 35 is max rudder angle, 60 is half width
  
  return (
    <div 
      className="rounded-lg p-3"
      style={{ 
        backgroundColor: '#1a1a2a',
        border: '2px solid #333344'
      }}
    >
      <div className="text-xs font-bold mb-2 text-center" style={{ color: '#ffcc00' }}>
        HELM CONTROL
      </div>
      
      {/* Rudder Angle Display */}
      <div 
        className="mb-3 p-2 rounded"
        style={{ backgroundColor: '#0a0a15' }}
      >
        <div className="text-[10px] text-center mb-1" style={{ color: '#888888' }}>
          RUDDER ANGLE
        </div>
        <div className="flex items-center justify-center gap-4">
          <span className="text-xs" style={{ color: '#ff4444' }}>P</span>
          <div 
            className="relative h-4 rounded"
            style={{ 
              width: '120px',
              backgroundColor: '#1a1a25',
              border: '1px solid #333344'
            }}
          >
            {/* Center line */}
            <div 
              className="absolute top-0 bottom-0 w-0.5"
              style={{ 
                left: '50%',
                transform: 'translateX(-50%)',
                backgroundColor: '#333344'
              }}
            />
            {/* Rudder indicator */}
            <div 
              className="absolute top-0 bottom-0 w-2 rounded transition-all duration-200"
              style={{ 
                left: `calc(50% + ${rudderIndicatorX}px)`,
                transform: 'translateX(-50%)',
                backgroundColor: rudderAngle < 0 ? '#ff4444' : rudderAngle > 0 ? '#00ff00' : '#ffcc00'
              }}
            />
          </div>
          <span className="text-xs" style={{ color: '#00ff00' }}>S</span>
        </div>
        <div 
          className="text-center text-lg font-mono font-bold mt-1"
          style={{ 
            color: rudderAngle < 0 ? '#ff4444' : rudderAngle > 0 ? '#00ff00' : '#ffcc00'
          }}
        >
          {rudderAngle < 0 ? 'P' : rudderAngle > 0 ? 'S' : ''}{Math.abs(rudderAngle).toFixed(1)}°
        </div>
      </div>
      
      {/* Helm Orders */}
      <div className="flex gap-2">
        {/* Port Orders */}
        <div className="flex flex-col gap-1">
          {portOrders.map(order => (
            <button
              key={order}
              onClick={() => onOrderChange(order)}
              className="px-2 py-1 rounded text-[9px] font-bold transition-all"
              style={{
                backgroundColor: getBackgroundColor(order),
                color: getOrderColor(order),
                border: order === currentOrder ? '1px solid #ff4444' : '1px solid #333344',
                minWidth: '60px'
              }}
            >
              {getHelmOrderText(order)}
            </button>
          ))}
        </div>
        
        {/* Midships */}
        <div className="flex flex-col justify-center">
          <button
            onClick={() => onOrderChange('MIDSHIPS')}
            className="px-2 py-6 rounded text-xs font-bold"
            style={{
              backgroundColor: currentOrder === 'MIDSHIPS' ? '#333300' : '#1a1a25',
              color: currentOrder === 'MIDSHIPS' ? '#ffcc00' : '#666666',
              border: currentOrder === 'MIDSHIPS' ? '2px solid #ffcc00' : '1px solid #333344'
            }}
          >
            MID<br/>SHIPS
          </button>
        </div>
        
        {/* Starboard Orders */}
        <div className="flex flex-col gap-1">
          {stbdOrders.map(order => (
            <button
              key={order}
              onClick={() => onOrderChange(order)}
              className="px-2 py-1 rounded text-[9px] font-bold transition-all"
              style={{
                backgroundColor: getBackgroundColor(order),
                color: getOrderColor(order),
                border: order === currentOrder ? '1px solid #00ff00' : '1px solid #333344',
                minWidth: '60px'
              }}
            >
              {getHelmOrderText(order)}
            </button>
          ))}
        </div>
      </div>
      
      {/* Current Order Display */}
      <div 
        className="mt-3 p-2 rounded text-center"
        style={{ 
          backgroundColor: '#0a0a15',
          border: '1px solid #333344'
        }}
      >
        <div className="text-[10px]" style={{ color: '#888888' }}>ORDER</div>
        <div 
          className="text-sm font-bold"
          style={{ 
            color: currentOrder.includes('PORT') ? '#ff4444' : 
                   currentOrder.includes('STBD') ? '#00ff00' : '#ffcc00'
          }}
        >
          {getHelmOrderText(currentOrder)}
        </div>
      </div>
    </div>
  );
}
