import React, { useRef, useState, useCallback, useEffect } from 'react';

const GridPattern = ({ className = '', cellSize = 40, dotRadius = 1.2, glowRadius = 180 }) => {
  const svgRef = useRef(null);
  const [mousePos, setMousePos] = useState({ x: -1000, y: -1000 });
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });
  const animationFrame = useRef(null);

  useEffect(() => {
    const updateDimensions = () => {
      if (svgRef.current?.parentElement) {
        const rect = svgRef.current.parentElement.getBoundingClientRect();
        setDimensions({ width: rect.width, height: rect.height });
      }
    };
    updateDimensions();
    window.addEventListener('resize', updateDimensions);
    return () => window.removeEventListener('resize', updateDimensions);
  }, []);

  const handleMouseMove = useCallback((e) => {
    if (animationFrame.current) cancelAnimationFrame(animationFrame.current);
    animationFrame.current = requestAnimationFrame(() => {
      const rect = svgRef.current?.getBoundingClientRect();
      if (rect) {
        setMousePos({ x: e.clientX - rect.left, y: e.clientY - rect.top });
      }
    });
  }, []);

  const handleMouseLeave = useCallback(() => {
    setMousePos({ x: -1000, y: -1000 });
  }, []);

  const cols = Math.ceil(dimensions.width / cellSize) + 1;
  const rows = Math.ceil(dimensions.height / cellSize) + 1;

  const dots = [];
  for (let row = 0; row < rows; row++) {
    for (let col = 0; col < cols; col++) {
      const x = col * cellSize;
      const y = row * cellSize;
      const dx = mousePos.x - x;
      const dy = mousePos.y - y;
      const dist = Math.sqrt(dx * dx + dy * dy);
      const intensity = Math.max(0, 1 - dist / glowRadius);
      const r = dotRadius + intensity * 2;
      const opacity = 0.12 + intensity * 0.88;
      
      dots.push(
        <circle
          key={`${row}-${col}`}
          cx={x}
          cy={y}
          r={r}
          fill={intensity > 0 ? `rgba(0, 255, 136, ${opacity})` : `rgba(255, 255, 255, 0.08)`}
          style={{ transition: 'fill 0.15s ease, r 0.15s ease' }}
        />
      );
    }
  }

  return (
    <svg
      ref={svgRef}
      className={className}
      style={{
        position: 'absolute',
        inset: 0,
        width: '100%',
        height: '100%',
        pointerEvents: 'auto',
        zIndex: 0,
      }}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
    >
      {dots}
    </svg>
  );
};

export default GridPattern;
