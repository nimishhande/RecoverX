import React, { useRef, useEffect, useState } from 'react';

const FloatingOrbs = () => {
  const containerRef = useRef(null);
  const [orbs, setOrbs] = useState([]);

  useEffect(() => {
    const orbData = Array.from({ length: 5 }, (_, i) => ({
      id: i,
      size: 200 + Math.random() * 400,
      x: Math.random() * 100,
      y: Math.random() * 100,
      duration: 15 + Math.random() * 20,
      delay: Math.random() * -20,
      opacity: 0.08 + Math.random() * 0.12,
      hue: i % 2 === 0 ? '140, 100%, 50%' : '160, 80%, 40%',
    }));
    setOrbs(orbData);
  }, []);

  return (
    <div
      ref={containerRef}
      style={{
        position: 'absolute',
        inset: 0,
        overflow: 'hidden',
        pointerEvents: 'none',
        zIndex: 0,
      }}
    >
      {orbs.map((orb) => (
        <div
          key={orb.id}
          style={{
            position: 'absolute',
            width: `${orb.size}px`,
            height: `${orb.size}px`,
            left: `${orb.x}%`,
            top: `${orb.y}%`,
            borderRadius: '50%',
            background: `radial-gradient(circle, hsla(${orb.hue}, ${orb.opacity}) 0%, transparent 70%)`,
            filter: 'blur(60px)',
            animation: `floatOrb${orb.id} ${orb.duration}s ease-in-out infinite`,
            animationDelay: `${orb.delay}s`,
            transform: 'translate(-50%, -50%)',
          }}
        />
      ))}
      <style>{`
        ${orbs.map((orb) => `
          @keyframes floatOrb${orb.id} {
            0%, 100% { transform: translate(-50%, -50%) translate(0, 0); }
            25% { transform: translate(-50%, -50%) translate(${30 + Math.random() * 40}px, ${-20 - Math.random() * 40}px); }
            50% { transform: translate(-50%, -50%) translate(${-20 - Math.random() * 30}px, ${30 + Math.random() * 30}px); }
            75% { transform: translate(-50%, -50%) translate(${20 + Math.random() * 20}px, ${20 + Math.random() * 20}px); }
          }
        `).join('')}
      `}</style>
    </div>
  );
};

export default FloatingOrbs;
