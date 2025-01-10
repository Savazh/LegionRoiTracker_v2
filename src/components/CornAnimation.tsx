import { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';

interface CornEmoji {
  id: number;
  x: number;
  y: number;
  rotation: number;
  delay: number;
  tx: number;
  ty: number;
}

export function CornAnimation() {
  const [corns, setCorns] = useState<CornEmoji[]>([]);
  const [isVisible, setIsVisible] = useState(true);
  const location = useLocation();

  // Only show on main page
  useEffect(() => {
    setIsVisible(location.pathname === '/');
  }, [location]);

  useEffect(() => {
    if (!isVisible) return;

    const generateCorns = () => {
      const numCorns = 8; // Increased for more activity
      return Array.from({ length: numCorns }, (_, i) => ({
        id: Date.now() + i,
        x: Math.random() * 100,
        y: -10, // Start above viewport
        rotation: Math.random() * 720 - 360, // More rotation range
        delay: Math.random() * 1000,
        tx: Math.random() * 200 - 100,
        ty: Math.random() * 50 + 100
      }));
    };

    // Initial corns
    setCorns(generateCorns());

    // Update corns every 2 seconds
    const interval = setInterval(() => {
      setCorns(prev => [...prev, ...generateCorns()].slice(-20)); // Keep max 20 corns
    }, 2000);

    return () => clearInterval(interval);
  }, [isVisible]);

  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden">
      {corns.map((corn) => (
        <div
          key={corn.id}
          className="absolute text-3xl animate-float"
          style={{
            left: `${corn.x}%`,
            top: `${corn.y}%`,
            animationDelay: `${corn.delay}ms`,
            '--rotation': `${corn.rotation}deg`,
            '--tx': `${corn.tx}px`,
            '--ty': `${corn.ty}px`
          } as React.CSSProperties}
        >
          🌽
        </div>
      ))}
    </div>
  );
}