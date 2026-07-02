'use client';

import { useEffect, useState } from 'react';

const EMOJIS = ['🌟', '🏆', '🎉', '💎', '✨', '🚀', '🎯', '👑'];
const COLORS = ['#5ED7FF', '#5AF2C1', '#FFF85A', '#F07AF5', '#FF9C3A', '#10b981'];

interface Particle {
  id: number;
  x: number;
  emoji: string;
  color: string;
  delay: number;
  duration: number;
}

let particleId = 0;

export function AcademyConfetti({ trigger }: { trigger: number }) {
  const [particles, setParticles] = useState<Particle[]>([]);

  useEffect(() => {
    if (trigger <= 0) return;
    const newParticles: Particle[] = [];
    for (let i = 0; i < 20; i++) {
      newParticles.push({
        id: particleId++,
        x: Math.random() * 100,
        emoji: EMOJIS[Math.floor(Math.random() * EMOJIS.length)],
        color: COLORS[Math.floor(Math.random() * COLORS.length)],
        delay: Math.random() * 0.5,
        duration: 1.5 + Math.random() * 2,
      });
    }
    setParticles(newParticles);
    const timer = setTimeout(() => setParticles([]), 3500);
    return () => clearTimeout(timer);
  }, [trigger]);

  if (particles.length === 0) return null;

  return (
    <div className="fixed inset-0 z-[2000] pointer-events-none overflow-hidden">
      {particles.map((p) => (
        <span
          key={p.id}
          className="absolute animate-fall"
          style={{
            left: `${p.x}%`,
            top: '-5%',
            fontSize: '1.2rem',
            animationDelay: `${p.delay}s`,
            animationDuration: `${p.duration}s`,
          }}
        >
          {p.emoji}
        </span>
      ))}
      <style jsx>{`
        @keyframes fall {
          0% { transform: translateY(0) rotate(0deg); opacity: 1; }
          100% { transform: translateY(105vh) rotate(720deg); opacity: 0; }
        }
        .animate-fall {
          animation: fall linear forwards;
        }
      `}</style>
    </div>
  );
}
