"use client";

import type { FC } from 'react';

interface MoonPhaseIconProps {
  phase: number; // 0 to 1, where 0.5 is full moon
  size?: number;
  className?: string;
}

const MoonPhaseIcon: FC<MoonPhaseIconProps> = ({ phase, size = 100, className }) => {
  const R = size / 2;
  const x = R;
  const y = R;

  // The radius of the terminator ellipse
  const r = R * Math.cos(2 * Math.PI * phase);

  // The path for the lit part of the moon
  const path = `M ${x} ${y-R} A ${R} ${R} 0 1 1 ${x} ${y+R} A ${Math.abs(r)} ${R} 0 1 ${phase < 0.5 ? 0:1} ${x} ${y-R} Z`;
  
  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className={className} aria-hidden="true">
       {/* Always draw the dark circle underneath */}
      <circle cx={x} cy={y} r={R} fill="hsl(var(--muted) / 0.5)" />
      <path d={path} fill="hsl(var(--accent))" />
    </svg>
  );
};

export default MoonPhaseIcon;
