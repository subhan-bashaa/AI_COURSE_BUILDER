import { useEffect, useRef } from 'react';

/**
 * Premium Particle Background Component
 * Simple Canvas-based floating particles
 * Like Notion AI / Vercel AI / Linear
 */
const ParticleBackground = () => {
  const canvasRef = useRef(null);
  const particles = useRef([]);
  const animationFrameId = useRef(null);
  const mouse = useRef({ x: null, y: null, radius: 150 });

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    let width = window.innerWidth;
    let height = window.innerHeight;

    canvas.width = width;
    canvas.height = height;

    // Particle class
    class Particle {
      constructor() {
        this.x = Math.random() * width;
        this.y = Math.random() * height;
        this.size = Math.random() * 1.5 + 1; // 1-2.5px (small)
        this.speedX = (Math.random() - 0.5) * 0.5; // Slow floating
        this.speedY = (Math.random() - 0.5) * 0.5;
        this.color = this.randomColor();
        this.opacity = Math.random() * 0.5 + 0.5; // 0.5-1.0
      }

      randomColor() {
        const colors = [
          '#6366f1', // indigo
          '#8b5cf6', // violet
          '#06b6d4', // cyan
          '#ec4899', // pink
          '#3b82f6', // blue
        ];
        return colors[Math.floor(Math.random() * colors.length)];
      }

      update() {
        // Gentle floating movement
        this.x += this.speedX;
        this.y += this.speedY;

        // Mouse repulsion
        if (mouse.current.x !== null && mouse.current.y !== null) {
          const dx = this.x - mouse.current.x;
          const dy = this.y - mouse.current.y;
          const distance = Math.sqrt(dx * dx + dy * dy);
          
          if (distance < mouse.current.radius) {
            const force = (mouse.current.radius - distance) / mouse.current.radius;
            const pushX = (dx / distance) * force * 3;
            const pushY = (dy / distance) * force * 3;
            
            this.x += pushX;
            this.y += pushY;
          }
        }

        // Wrap around edges
        if (this.x > width) this.x = 0;
        if (this.x < 0) this.x = width;
        if (this.y > height) this.y = 0;
        if (this.y < 0) this.y = height;
      }

      draw() {
        ctx.save();
        ctx.globalAlpha = this.opacity;
        ctx.fillStyle = this.color;
        ctx.shadowBlur = 10;
        ctx.shadowColor = this.color;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      }
    }

    // Initialize particles
    const initParticles = () => {
      particles.current = [];
      const numberOfParticles = Math.floor((width * height) / 6000); // More particles
      
      for (let i = 0; i < numberOfParticles; i++) {
        particles.current.push(new Particle());
      }
    };

    // Animation loop - no connection lines
    const animate = () => {
      ctx.clearRect(0, 0, width, height);

      particles.current.forEach(particle => {
        particle.update();
        particle.draw();
      });

      animationFrameId.current = requestAnimationFrame(animate);
    };

    // Mouse events
    const handleMouseMove = (e) => {
      mouse.current.x = e.clientX;
      mouse.current.y = e.clientY;
    };

    const handleMouseLeave = () => {
      mouse.current.x = null;
      mouse.current.y = null;
    };

    // Resize handler
    const handleResize = () => {
      width = window.innerWidth;
      height = window.innerHeight;
      canvas.width = width;
      canvas.height = height;
      initParticles();
    };

    // Initialize
    initParticles();
    animate();

    // Event listeners
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseleave', handleMouseLeave);
    window.addEventListener('resize', handleResize);

    // Cleanup
    return () => {
      cancelAnimationFrame(animationFrameId.current);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseleave', handleMouseLeave);
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 pointer-events-none"
      style={{ zIndex: 0, opacity: 0.8 }}
    />
  );
};

export default ParticleBackground;
