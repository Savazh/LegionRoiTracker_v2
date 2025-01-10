import { useEffect, useState } from 'react';

interface FallingLogo {
  id: number;
  x: number;
  delay: number;
  duration: number;
  rotation: number;
  scale: number;
}

export function FallingLogos({ logoUrl }: { logoUrl: string }) {
  const [logos, setLogos] = useState<FallingLogo[]>([]);

  useEffect(() => {
    const generateLogos = () => {
      const numLogos = 5; // Increased for more activity
      return Array.from({ length: numLogos }, (_, i) => ({
        id: Date.now() + i,
        x: Math.random() * 100,
        delay: Math.random() * 1000,
        duration: 4000 + Math.random() * 2000, // Longer duration for smoother fall
        rotation: Math.random() * 720 - 360, // More rotation range
        scale: 0.5 + Math.random() * 1 // Random sizes
      }));
    };

    // Initial logos
    setLogos(generateLogos());

    // Update logos every 2 seconds
    const interval = setInterval(() => {
      setLogos(prev => [...prev, ...generateLogos()].slice(-15)); // Keep max 15 logos
    }, 2000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden">
      {logos.map((logo) => (
        <img
          key={logo.id}
          src={logoUrl}
          alt="Falling Logo"
          className="absolute w-8 h-8 rounded-full opacity-50 animate-fall"
          style={{
            left: `${logo.x}%`,
            top: '-32px',
            animationDuration: `${logo.duration}ms`,
            animationDelay: `${logo.delay}ms`,
            transform: `rotate(${logo.rotation}deg) scale(${logo.scale})`,
            willChange: 'transform'
          }}
        />
      ))}
    </div>
  );
}