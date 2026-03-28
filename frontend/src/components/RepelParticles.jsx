import React, { useRef, useEffect, useCallback } from 'react';

class Particle {
  constructor(x, y, canvas) {
    this.x = x;
    this.y = y;
    this.originX = x;
    this.originY = y;
    this.canvas = canvas;
    this.size = Math.random() * 2 + 0.5;
    this.baseAlpha = Math.random() * 0.4 + 0.1;
    this.alpha = this.baseAlpha;
    this.vx = 0;
    this.vy = 0;
    this.friction = 0.92;
    this.springFactor = 0.02 + Math.random() * 0.03;
    this.color = Math.random() > 0.7 ? '0, 255, 136' : '255, 255, 255';
    this.pulsePhase = Math.random() * Math.PI * 2;
    this.pulseSpeed = 0.01 + Math.random() * 0.02;
  }

  update(mouseX, mouseY, repelRadius, time) {
    const dx = this.x - mouseX;
    const dy = this.y - mouseY;
    const dist = Math.sqrt(dx * dx + dy * dy);

    if (dist < repelRadius && dist > 0) {
      const force = (repelRadius - dist) / repelRadius;
      const angle = Math.atan2(dy, dx);
      this.vx += Math.cos(angle) * force * 3;
      this.vy += Math.sin(angle) * force * 3;
      this.alpha = Math.min(1, this.baseAlpha + force * 0.8);
    } else {
      this.alpha += (this.baseAlpha - this.alpha) * 0.05;
    }

    // pulse
    this.pulsePhase += this.pulseSpeed;
    const pulse = Math.sin(this.pulsePhase) * 0.1;
    this.alpha = Math.max(0.05, this.alpha + pulse);

    // spring back
    const dxOrigin = this.originX - this.x;
    const dyOrigin = this.originY - this.y;
    this.vx += dxOrigin * this.springFactor;
    this.vy += dyOrigin * this.springFactor;

    this.vx *= this.friction;
    this.vy *= this.friction;
    this.x += this.vx;
    this.y += this.vy;
  }

  draw(ctx) {
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
    ctx.fillStyle = `rgba(${this.color}, ${this.alpha})`;
    ctx.fill();
  }
}

const RepelParticles = ({ className = '', particleSpacing = 28, repelRadius = 120 }) => {
  const canvasRef = useRef(null);
  const particlesRef = useRef([]);
  const mouseRef = useRef({ x: -1000, y: -1000 });
  const rafRef = useRef(null);
  const timeRef = useRef(0);

  const initParticles = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const parent = canvas.parentElement;
    canvas.width = parent.clientWidth;
    canvas.height = parent.clientHeight;

    const particles = [];
    for (let x = particleSpacing; x < canvas.width; x += particleSpacing) {
      for (let y = particleSpacing; y < canvas.height; y += particleSpacing) {
        particles.push(new Particle(x, y, canvas));
      }
    }
    particlesRef.current = particles;
  }, [particleSpacing]);

  useEffect(() => {
    initParticles();
    window.addEventListener('resize', initParticles);
    return () => window.removeEventListener('resize', initParticles);
  }, [initParticles]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');

    const animate = () => {
      timeRef.current += 0.016;
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      const particles = particlesRef.current;
      const mouse = mouseRef.current;

      for (let i = 0; i < particles.length; i++) {
        particles[i].update(mouse.x, mouse.y, repelRadius, timeRef.current);
        particles[i].draw(ctx);
      }

      rafRef.current = requestAnimationFrame(animate);
    };

    rafRef.current = requestAnimationFrame(animate);
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [repelRadius]);

  const handleMouseMove = useCallback((e) => {
    const rect = canvasRef.current?.getBoundingClientRect();
    if (rect) {
      mouseRef.current = { x: e.clientX - rect.left, y: e.clientY - rect.top };
    }
  }, []);

  const handleMouseLeave = useCallback(() => {
    mouseRef.current = { x: -1000, y: -1000 };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className={className}
      style={{
        position: 'absolute',
        inset: 0,
        width: '100%',
        height: '100%',
        pointerEvents: 'auto',
        zIndex: 1,
      }}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
    />
  );
};

export default RepelParticles;
