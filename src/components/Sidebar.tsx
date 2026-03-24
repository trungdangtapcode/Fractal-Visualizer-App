import React, { useState } from 'react';

type FractalType = 'Mandelbrot' | 'Julia' | 'BurningShip' | 'JuliaSpectrum' | 'KochSnowflake' | 'MinkowskiIsland' | 'SierpinskiTriangle' | 'SierpinskiCarpet';

interface SidebarProps {
  activeFractal: FractalType;
  onSelectFractal: (type: FractalType) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ activeFractal, onSelectFractal }) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const fractals: FractalType[] = [
    'Mandelbrot',
    // 'Julia',
    // 'BurningShip',
    // 'JuliaSpectrum',
    'KochSnowflake',
    'MinkowskiIsland',
    'SierpinskiTriangle',
    'SierpinskiCarpet',
  ];

  return (
    <div 
      className={`sidebar-nav ${isExpanded ? 'expanded' : ''}`}
      onMouseEnter={() => setIsExpanded(true)}
      onMouseLeave={() => setIsExpanded(false)}
    >
      <div className="sidebar-header">
        <span className="sidebar-logo">{isExpanded ? 'FRACTAL' : 'F'}</span>
      </div>
      <div className="sidebar-menu">
        {fractals.map((f) => {
          const isActive = activeFractal === f;
          return (
            <button
              key={f}
              onClick={() => onSelectFractal(f)}
              className={`sidebar-btn ${isActive ? 'active' : ''}`}
              title={f}
            >
              <span className="btn-icon">{f.substring(0, 1)}</span>
              {isExpanded && <span className="btn-label">{f}</span>}
            </button>
          );
        })}
      </div>
    </div>
  );
};