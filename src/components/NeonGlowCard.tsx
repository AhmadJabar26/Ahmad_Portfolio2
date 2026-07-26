import React, { useState, useRef } from "react";

interface NeonGlowCardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  className?: string;
  glowColor?: string; // default purple/indigo
  borderColor?: string;
}

export const NeonGlowCard: React.FC<NeonGlowCardProps> = ({
  children,
  className = "",
  glowColor = "rgba(168, 85, 247, 0.25)", // Purple-500 neon
  borderColor = "rgba(192, 132, 252, 0.6)", // Light Purple border glow
  style,
  ...props
}) => {
  const cardRef = useRef<HTMLDivElement>(null);
  const [mousePos, setMousePos] = useState({ x: -1000, y: -1000 });
  const [isHovered, setIsHovered] = useState(false);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    setMousePos({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    });
  };

  const handleMouseEnter = () => setIsHovered(true);
  const handleMouseLeave = () => {
    setIsHovered(false);
    setMousePos({ x: -1000, y: -1000 });
  };

  return (
    <div
      ref={cardRef}
      onMouseMove={handleMouseMove}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      className={`relative overflow-hidden rounded-[2rem] bg-zinc-950/70 border border-white/10 transition-all duration-300 ${
        isHovered ? "shadow-[0_0_35px_rgba(168,85,247,0.22)] border-purple-500/40" : ""
      } ${className}`}
      style={style}
      {...props}
    >
      {/* Neon Purple Spotlight Glow overlay that moves with cursor */}
      <div
        className="pointer-events-none absolute -inset-px z-10 transition-opacity duration-300"
        style={{
          opacity: isHovered ? 1 : 0,
          background: `radial-gradient(500px circle at ${mousePos.x}px ${mousePos.y}px, ${glowColor}, rgba(139, 92, 246, 0.08) 40%, transparent 80%)`,
        }}
      />

      {/* Dynamic Cursor Border Highlight */}
      <div
        className="pointer-events-none absolute -inset-px z-20 rounded-[2rem] transition-opacity duration-300"
        style={{
          opacity: isHovered ? 1 : 0,
          padding: "1px",
          background: `radial-gradient(350px circle at ${mousePos.x}px ${mousePos.y}px, ${borderColor}, rgba(168, 85, 247, 0.15) 50%, transparent 100%)`,
          WebkitMask: "linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)",
          WebkitMaskComposite: "xor",
          maskComposite: "exclude",
        }}
      />

      {/* Card Content Container */}
      <div className="relative z-20 h-full">{children}</div>
    </div>
  );
};
