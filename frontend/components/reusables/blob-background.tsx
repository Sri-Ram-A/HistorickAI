"use client";

import { useEffect, useRef } from 'react';
import { useTheme } from "next-themes";

interface BlobBackgroundProps {
  interactive?: boolean;
  intensity?: 'low' | 'medium' | 'high';
}

interface BlobConfig {
  size: string;
  gradient: string;
  position: string;
  animation: string;
  speed: number;
}

const BlobBackground = ({
  interactive = true,
  intensity = 'medium'
}: BlobBackgroundProps) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const blobRefs = useRef<(HTMLDivElement | null)[]>([]);
  const animationRef = useRef<number>(0);
  const { theme } = useTheme();
  
  const isLight = theme === "light";

  // Intensity configuration
  const intensityConfig = {
    low: { blur: 'blur-xl', opacity: isLight ? 'opacity-20' : 'opacity-50' },
    medium: { blur: 'blur-3xl', opacity: isLight ? 'opacity-30' : 'opacity-70' },
    high: { blur: 'blur-[100px]', opacity: isLight ? 'opacity-40' : 'opacity-80' }
  };

  const { blur, opacity } = intensityConfig[intensity];

  // Blob configurations with movement parameters
  const blobs: BlobConfig[] = [
    {
      size: 'w-16 h-12 sm:w-20 sm:h-14 md:w-24 md:h-16 lg:w-28 lg:h-20',
      gradient: 'from-purple-500 via-violet-500 to-blue-500',
      position: 'left-[75%] top-[40%]',
      animation: 'animate-blob-float-1',
      speed: 0.3
    },
    {
      size: 'w-36 h-24 sm:w-44 sm:h-28 md:w-48 md:h-32 lg:w-56 lg:h-36',
      gradient: 'from-orange-500 via-red-500 to-pink-500',
      position: 'left-2 top-2',
      animation: 'animate-blob-float-2',
      speed: 0.5
    },
    {
      size: 'w-20 h-14 sm:w-24 sm:h-16 md:w-28 md:h-20 lg:w-32 lg:h-24',
      gradient: 'from-teal-400 via-cyan-500 to-sky-500',
      position: 'left-[8rem] top-48 sm:left-40 md:top-52',
      animation: 'animate-blob-float-3',
      speed: 0.4
    },
    {
      size: 'w-16 h-20 sm:w-20 sm:h-24 md:w-24 md:h-28 lg:w-28 lg:h-32',
      gradient: 'from-pink-500 via-rose-500 to-purple-500',
      position: 'left-64 top-8 sm:left-72 md:left-80 md:top-12',
      animation: 'animate-blob-float-4',
      speed: 0.6
    },
    {
      size: 'w-16 h-20 sm:w-20 sm:h-24 md:w-24 md:h-28 lg:w-28 lg:h-32',
      gradient: 'from-indigo-600 via-violet-600 to-purple-600',
      position: 'left-[25rem] top-4 sm:left-[27.5rem] md:left-[30rem] md:top-6',
      animation: 'animate-blob-float-5',
      speed: 0.35
    },
    {
      size: 'w-28 h-28 sm:w-32 sm:h-32 md:w-36 md:h-36 lg:w-40 lg:h-40',
      gradient: 'from-blue-700 via-indigo-800 to-purple-900',
      position: 'left-[31.25rem] top-28 sm:left-[34.375rem] md:left-[37.5rem] md:top-36',
      animation: 'animate-blob-float-6',
      speed: 0.45
    },
    {
      size: 'w-28 h-28 sm:w-32 sm:h-32 md:w-36 md:h-36 lg:w-40 lg:h-40',
      gradient: 'from-purple-800 via-violet-900 to-indigo-950',
      position: 'left-[43.75rem] top-4 sm:left-[46.875rem] md:left-[50rem] md:top-6',
      animation: 'animate-blob-float-7',
      speed: 0.55
    },
    {
      size: 'w-20 h-16 sm:w-24 sm:h-20 md:w-28 md:h-24 lg:w-32 lg:h-28',
      gradient: 'from-amber-500 via-orange-600 to-red-700',
      position: 'left-[10%] top-[70%] sm:left-[15%] sm:top-[75%]',
      animation: 'animate-blob-float-8',
      speed: 0.4
    },
    {
      size: 'w-24 h-20 sm:w-28 sm:h-24 md:w-32 md:h-28 lg:w-36 lg:h-32',
      gradient: 'from-fuchsia-600 via-purple-700 to-violet-800',
      position: 'left-[85%] top-[15%] sm:left-[82%] sm:top-[20%]',
      animation: 'animate-blob-float-9',
      speed: 0.65
    },
    {
      size: 'w-12 h-12 sm:w-16 sm:h-16 md:w-20 md:h-20 lg:w-24 lg:h-24',
      gradient: 'from-yellow-400 via-amber-500 to-orange-500',
      position: 'left-[60%] top-[80%] sm:left-[65%] sm:top-[85%]',
      animation: 'animate-blob-float-10',
      speed: 0.3
    },
    {
      size: 'w-24 h-24 sm:w-28 sm:h-28 md:w-32 md:h-32 lg:w-36 lg:h-36',
      gradient: 'from-emerald-500 via-teal-600 to-cyan-700',
      position: 'left-[30%] top-[10%] sm:left-[35%] sm:top-[15%]',
      animation: 'animate-blob-float-11',
      speed: 0.5
    }
  ];

  // Smooth floating animation
  useEffect(() => {
    const updateBlobs = () => {
      const time = Date.now() * 0.001;
      
      blobRefs.current.forEach((blob, index) => {
        if (!blob) return;
        
        const config = blobs[index];
        if (!config) return;
        
        // Create smooth floating motion
        const x = Math.sin(time * 0.5 + index * 0.7) * 40 * config.speed;
        const y = Math.cos(time * 0.3 + index * 0.5) * 30 * config.speed;
        const rotation = Math.sin(time * 0.2 + index) * 10;
        
        blob.style.transform = `translate(${x}px, ${y}px) rotate(${rotation}deg)`;
      });
      
      animationRef.current = requestAnimationFrame(updateBlobs);
    };
    
    animationRef.current = requestAnimationFrame(updateBlobs);
    
    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, []);

  // Interactive mouse effects
  useEffect(() => {
    if (!interactive) return;

    let mouseX = 0.5;
    let mouseY = 0.5;
    let targetX = 0.5;
    let targetY = 0.5;

    const handleMouseMove = (e: MouseEvent) => {
      targetX = e.clientX / window.innerWidth;
      targetY = e.clientY / window.innerHeight;
    };

    const updateMousePosition = () => {
      // Smooth interpolation
      mouseX += (targetX - mouseX) * 0.1;
      mouseY += (targetY - mouseY) * 0.1;
      
      blobRefs.current.forEach((blob, index) => {
        if (!blob) return;
        
        const config = blobs[index];
        const xOffset = (mouseX - 0.5) * 60 * config.speed;
        const yOffset = (mouseY - 0.5) * 60 * config.speed;
        
        // Get current transform and extract rotation
        const computedStyle = window.getComputedStyle(blob);
        const transform = computedStyle.transform;
        let rotation = 0;
        
        // Extract rotation from matrix if exists
        if (transform && transform !== 'none') {
          const matrix = transform.match(/^matrix\(([^)]+)\)$/);
          if (matrix) {
            const values = matrix[1].split(', ').map(Number);
            rotation = Math.atan2(values[1], values[0]) * (180 / Math.PI);
          }
        }
        
        blob.style.transform = `translate(${xOffset}px, ${yOffset}px) rotate(${rotation}deg)`;
      });
      
      requestAnimationFrame(updateMousePosition);
    };

    window.addEventListener('mousemove', handleMouseMove);
    updateMousePosition();
    
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
    };
  }, [interactive]);

  // Generate random stars for dark theme
  const generateStars = () => {
    return Array.from({ length: 30 }).map((_, i) => {
      const size = Math.random() * 2 + 1;
      return (
        <div
          key={`star-${i}`}
          className="absolute bg-white rounded-full animate-pulse"
          style={{
            width: `${size}px`,
            height: `${size}px`,
            left: `${Math.random() * 100}%`,
            top: `${Math.random() * 100}%`,
            animationDelay: `${Math.random() * 5}s`,
            animationDuration: `${Math.random() * 3 + 2}s`,
            opacity: Math.random() * 0.5 + 0.2,
          }}
        />
      );
    });
  };

  return (
    <>
      {/* Add custom animations to global styles */}
      <style jsx global>{`
        @keyframes float {
          0%, 100% {
            transform: translate(0, 0) rotate(0deg);
          }
          25% {
            transform: translate(20px, -20px) rotate(5deg);
          }
          50% {
            transform: translate(-15px, 15px) rotate(-5deg);
          }
          75% {
            transform: translate(-10px, -10px) rotate(3deg);
          }
        }
        
        @keyframes float2 {
          0%, 100% {
            transform: translate(0, 0) rotate(0deg);
          }
          33% {
            transform: translate(-25px, 15px) rotate(-7deg);
          }
          66% {
            transform: translate(15px, -25px) rotate(7deg);
          }
        }
        
        @keyframes float3 {
          0%, 100% {
            transform: translate(0, 0) rotate(0deg);
          }
          20% {
            transform: translate(30px, 10px) rotate(8deg);
          }
          40% {
            transform: translate(-20px, 20px) rotate(-8deg);
          }
          60% {
            transform: translate(10px, -30px) rotate(4deg);
          }
          80% {
            transform: translate(-30px, -10px) rotate(-4deg);
          }
        }
        
        .animate-blob-float-1 {
          animation: float 20s ease-in-out infinite;
        }
        
        .animate-blob-float-2 {
          animation: float2 25s ease-in-out infinite;
        }
        
        .animate-blob-float-3 {
          animation: float3 30s ease-in-out infinite;
        }
        
        .animate-blob-float-4 {
          animation: float 22s ease-in-out infinite reverse;
        }
        
        .animate-blob-float-5 {
          animation: float2 28s ease-in-out infinite;
        }
        
        .animate-blob-float-6 {
          animation: float3 32s ease-in-out infinite reverse;
        }
        
        .animate-blob-float-7 {
          animation: float 24s ease-in-out infinite;
        }
        
        .animate-blob-float-8 {
          animation: float2 26s ease-in-out infinite reverse;
        }
        
        .animate-blob-float-9 {
          animation: float3 34s ease-in-out infinite;
        }
        
        .animate-blob-float-10 {
          animation: float 18s ease-in-out infinite reverse;
        }
        
        .animate-blob-float-11 {
          animation: float2 30s ease-in-out infinite;
        }
      `}</style>

      <div
        className={`fixed inset-0 overflow-hidden -z-10 transition-colors duration-500 ${
          isLight
            ? 'bg-linear-to-br from-slate-50 via-white to-blue-50'
            : 'bg-linear-to-b from-gray-900 via-gray-950 to-black'
        }`}
        ref={containerRef}
      >
        {/* Blob Container */}
        <div className={`absolute inset-0 ${blur} ${opacity} transition-all duration-500`}>
          {blobs.map((blob, index) => (
            <div
              key={`blob-${index}`}
              ref={el => { blobRefs.current[index] = el; }}
              className={`
                absolute shape-blob
                ${blob.size}
                ${blob.position}
                ${blob.animation}
                bg-linear-to-br ${blob.gradient}
                rounded-[40%_50%_30%_40%]
                transition-all duration-1000 ease-out
                will-change-transform
                ${interactive ? 'mix-blend-overlay' : 'mix-blend-soft-light'}
              `}
              style={{
                animationDelay: `${index * 0.5}s`,
              }}
            />
          ))}

          {/* Stars effect for dark theme */}
          {!isLight && (
            <div className="absolute inset-0 transition-opacity duration-500">
              {generateStars()}
            </div>
          )}
        </div>

        {/* Ambient light effect for light theme */}
        {isLight && (
          <div className="absolute inset-0 bg-linear-to-tr from-transparent via-blue-50/30 to-purple-50/30 pointer-events-none" />
        )}
        
        {/* Subtle grain texture for depth */}
        <div className="absolute inset-0 opacity-[0.02] mix-blend-overlay" 
             style={{
               backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='1' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`
             }} />
      </div>
    </>
  );
};

export default BlobBackground;