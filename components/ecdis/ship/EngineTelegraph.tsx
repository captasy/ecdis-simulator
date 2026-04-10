'use client';

import { 
  type EngineOrder, 
  engineOrders, 
  getEngineOrderText,
  getTargetSpeed,
  defaultShipCharacteristics
} from '@/lib/ecdis/physics';
import type { ColorScheme } from '@/lib/ecdis/types';

interface EngineTelegraphProps {
  currentOrder: EngineOrder;
  onOrderChange: (order: EngineOrder) => void;
  speedThroughWater: number;
  colors: ColorScheme;
}

export function EngineTelegraph({
  currentOrder,
  onOrderChange,
  speedThroughWater,
  colors
}: EngineTelegraphProps) {
  
  const getOrderColor = (order: EngineOrder) => {
    if (order === currentOrder) {
      if (order.includes('AHEAD')) return '#00ff00';
      if (order.includes('ASTERN')) return '#ff4444';
      return '#ffcc00';
    }
    return '#444444';
  };
  
  const getBackgroundColor = (order: EngineOrder) => {
    if (order === currentOrder) {
      if (order.includes('AHEAD')) return '#003300';
      if (order.includes('ASTERN')) return '#330000';
      return '#333300';
    }
    return '#1a1a25';
  };
  
  return (
    <div 
      className="rounded-lg p-3"
      style={{ 
        backgroundColor: '#1a1a2a',
        border: '2px solid #333344'
      }}
    >
      <div className="text-xs font-bold mb-2 text-center" style={{ color: '#ffcc00' }}>
        ENGINE TELEGRAPH
      </div>
      
      {/* Speed Display */}
      <div 
        className="mb-3 p-2 rounded text-center"
        style={{ backgroundColor: '#0a0a15' }}
      >
        <div className="text-[10px]" style={{ color: '#888888' }}>SPEED (kn)</div>
        <div 
          className="text-2xl font-mono font-bold"
          style={{ color: speedThroughWater >= 0 ? '#00ff88' : '#ff8888' }}
        >
          {speedThroughWater.toFixed(1)}
        </div>
      </div>
      
      {/* Telegraph Lever Display */}
      <div className="flex gap-1">
        {/* Ahead Orders */}
        <div className="flex flex-col gap-1">
          {engineOrders.slice(0, 4).map(order => (
            <button
              key={order}
              onClick={() => onOrderChange(order)}
              className="px-2 py-1.5 rounded text-[9px] font-bold transition-all"
              style={{
                backgroundColor: getBackgroundColor(order),
                color: getOrderColor(order),
                border: order === currentOrder ? '1px solid #00ff00' : '1px solid #333344',
                minWidth: '70px'
              }}
            >
              {getEngineOrderText(order)}
            </button>
          ))}
        </div>
        
        {/* Stop */}
        <div className="flex flex-col justify-center">
          <button
            onClick={() => onOrderChange('STOP')}
            className="px-3 py-3 rounded text-xs font-bold"
            style={{
              backgroundColor: currentOrder === 'STOP' ? '#333300' : '#1a1a25',
              color: currentOrder === 'STOP' ? '#ffcc00' : '#666666',
              border: currentOrder === 'STOP' ? '2px solid #ffcc00' : '1px solid #333344'
            }}
          >
            STOP
          </button>
        </div>
        
        {/* Astern Orders */}
        <div className="flex flex-col gap-1">
          {engineOrders.slice(5).map(order => (
            <button
              key={order}
              onClick={() => onOrderChange(order)}
              className="px-2 py-1.5 rounded text-[9px] font-bold transition-all"
              style={{
                backgroundColor: getBackgroundColor(order),
                color: getOrderColor(order),
                border: order === currentOrder ? '1px solid #ff4444' : '1px solid #333344',
                minWidth: '70px'
              }}
            >
              {getEngineOrderText(order)}
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
            color: currentOrder.includes('AHEAD') ? '#00ff00' : 
                   currentOrder.includes('ASTERN') ? '#ff4444' : '#ffcc00'
          }}
        >
          {getEngineOrderText(currentOrder)}
        </div>
      </div>
    </div>
  );
}
