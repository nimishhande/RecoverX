import React from 'react';

const GlowBorder = ({ children, className = '', glowColor = 'rgba(0, 255, 136, 0.3)', style = {} }) => {
  return (
    <div className={`glow-border-wrapper ${className}`} style={{ position: 'relative', ...style }}>
      <div
        className="glow-border-effect"
        style={{
          position: 'absolute',
          inset: '-1px',
          borderRadius: 'inherit',
          background: `conic-gradient(from var(--glow-angle, 0deg), transparent 40%, ${glowColor} 50%, transparent 60%)`,
          animation: 'glowRotate 4s linear infinite',
          zIndex: 0,
          opacity: 0,
          transition: 'opacity 0.4s ease',
        }}
      />
      <div
        style={{
          position: 'relative',
          zIndex: 1,
          borderRadius: 'inherit',
          background: 'inherit',
        }}
      >
        {children}
      </div>
    </div>
  );
};

export default GlowBorder;
